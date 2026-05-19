import os
import json
import copy
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

# SQLite in-memory engine to support Base.metadata.create_all without writing to disk
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
Base = declarative_base()

class HiveQuery:
    def __init__(self, session, model_class, resolve_relations=True):
        self.session = session
        self.model_class = model_class
        self.table_name = model_class.__tablename__
        self.resolve_relations = resolve_relations
        
        box_data = self.session._load_box(self.table_name)
        self.results = []
        for key, raw_val in box_data.items():
            instance = self.model_class()
            for k, v in raw_val.items():
                if k in ["created_at", "updated_at"] and v:
                    try:
                        setattr(instance, k, datetime.fromisoformat(v))
                    except Exception:
                        setattr(instance, k, v)
                else:
                    setattr(instance, k, v)
            self.results.append(instance)
            
            # Register in session loaded_instances so updates are committed
            if instance not in self.session.loaded_instances:
                self.session.loaded_instances.append(instance)
                
        if self.resolve_relations:
            for instance in self.results:
                self._resolve_relationships(instance)

    def _resolve_relationships(self, instance):
        if not self.resolve_relations:
            return
            
        # Import models inside to prevent circular import since models imports Base from here
        from app.models.models import User, Profile, Roadmap, Interview
        
        table_name = self.table_name
        if table_name == "users":
            user_id = getattr(instance, "id", None)
            if user_id is not None:
                # Profiles (uselist=False)
                profiles = HiveQuery(self.session, Profile, resolve_relations=False).filter(Profile.user_id == user_id).results
                instance.profile = profiles[0] if profiles else None
                
                # Roadmaps (list)
                roadmaps = HiveQuery(self.session, Roadmap, resolve_relations=False).filter(Roadmap.user_id == user_id).results
                instance.roadmaps = roadmaps
                
                # Interviews (list)
                interviews = HiveQuery(self.session, Interview, resolve_relations=False).filter(Interview.user_id == user_id).results
                instance.interviews = interviews
                
        elif table_name in ["profiles", "roadmaps", "interviews"]:
            user_id = getattr(instance, "user_id", None)
            if user_id is not None:
                users = HiveQuery(self.session, User, resolve_relations=False).filter(User.id == user_id).results
                instance.user = users[0] if users else None

    def _parse_expression(self, expr):
        import operator
        left_name = None
        if hasattr(expr, "left"):
            left_name = getattr(expr.left, "name", getattr(expr.left, "key", None))
        
        right_val = None
        if hasattr(expr, "right"):
            if hasattr(expr.right, "value"):
                right_val = expr.right.value
            elif hasattr(expr.right, "element") and hasattr(expr.right.element, "value"):
                right_val = expr.right.element.value
            else:
                right_val = expr.right
                
        op = getattr(expr, "operator", operator.eq)
        return left_name, right_val, op

    def filter(self, *expressions):
        filtered_results = []
        for instance in self.results:
            match = True
            for expr in expressions:
                try:
                    left_name, right_val, op = self._parse_expression(expr)
                    val = getattr(instance, left_name, None)
                    
                    if op.__name__ in ["eq", "__eq__"]:
                        if val != right_val:
                            match = False
                            break
                    elif op.__name__ in ["ne", "__ne__"]:
                        if val == right_val:
                            match = False
                            break
                except Exception:
                    pass
            if match:
                filtered_results.append(instance)
        self.results = filtered_results
        return self

    def order_by(self, *args):
        if not args:
            return self
        arg = args[0]
        col_name = None
        reverse = False
        
        arg_str = str(arg)
        if "desc" in arg_str.lower():
            reverse = True
            
        if hasattr(arg, "element"):
            col_name = getattr(arg.element, "name", getattr(arg.element, "key", None))
        elif hasattr(arg, "name"):
            col_name = arg.name
        elif hasattr(arg, "key"):
            col_name = arg.key
            
        if col_name:
            def get_sort_key(instance):
                val = getattr(instance, col_name, None)
                if val is None:
                    return "" if isinstance(val, str) else 0
                return val
                
            self.results.sort(key=get_sort_key, reverse=reverse)
        return self

    def all(self):
        return self.results

    def first(self):
        return self.results[0] if self.results else None


class HiveSession:
    def __init__(self):
        self.added_instances = []
        self.loaded_instances = []
        self.data = {}
        self.data_dir = "./hive_data"
        os.makedirs(self.data_dir, exist_ok=True)

    def _get_box_path(self, table_name: str) -> str:
        return os.path.join(self.data_dir, f"{table_name}.json")

    def _load_box(self, table_name: str):
        if table_name in self.data:
            return self.data[table_name]
        path = self._get_box_path(table_name)
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    self.data[table_name] = json.load(f)
            except Exception:
                self.data[table_name] = {}
        else:
            self.data[table_name] = {}
        return self.data[table_name]

    def _save_box(self, table_name: str):
        if table_name not in self.data:
            return
        path = self._get_box_path(table_name)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.data[table_name], f, indent=2, default=str)

    def query(self, model_class):
        return HiveQuery(self, model_class)

    def add(self, instance):
        if instance not in self.added_instances:
            self.added_instances.append(instance)

    def commit(self):
        # Combine all added and loaded instances to persist changes
        all_instances = set(self.added_instances + self.loaded_instances)
        
        for instance in all_instances:
            table_name = instance.__tablename__
            box_data = self._load_box(table_name)
            
            # Auto-increment ID generation if missing
            if getattr(instance, "id", None) is None:
                existing_ids = [int(k) for k in box_data.keys() if k.isdigit()]
                new_id = max(existing_ids) + 1 if existing_ids else 1
                instance.id = new_id
                
            # Default timestamps
            if hasattr(instance, "created_at") and getattr(instance, "created_at", None) is None:
                instance.created_at = datetime.utcnow()
            if hasattr(instance, "updated_at"):
                instance.updated_at = datetime.utcnow()
                
            # Serialize model columns to dictionary
            instance_dict = {}
            for col in instance.__table__.columns:
                val = getattr(instance, col.name, None)
                if isinstance(val, datetime):
                    instance_dict[col.name] = val.isoformat()
                else:
                    instance_dict[col.name] = val
                    
            box_data[str(instance.id)] = instance_dict
            self._save_box(table_name)
            
        self.added_instances.clear()

    def refresh(self, instance):
        table_name = instance.__tablename__
        box_data = self._load_box(table_name)
        inst_id = getattr(instance, "id", None)
        if inst_id is not None and str(inst_id) in box_data:
            raw_val = box_data[str(inst_id)]
            for k, v in raw_val.items():
                if k in ["created_at", "updated_at"] and v:
                    try:
                        setattr(instance, k, datetime.fromisoformat(v))
                    except Exception:
                        setattr(instance, k, v)
                else:
                    setattr(instance, k, v)

    def close(self):
        pass


def get_db():
    db = HiveSession()
    try:
        yield db
    finally:
        db.close()
