import importlib.util

spec = importlib.util.spec_from_file_location("home_module", "home_portal.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
