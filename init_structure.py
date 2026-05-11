import os

def create_structure():
    base_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'app')
    
    directories = [
        "network_monitor",
        "ml_engine/models",
        "ml_engine/datasets",
        "prevention",
        "voice_assistant",
        "api",
        "database",
        "utils"
    ]

    for dir_path in directories:
        full_path = os.path.join(base_dir, dir_path)
        os.makedirs(full_path, exist_ok=True)
        
        # Create __init__.py in python packages
        if not dir_path.endswith("models") and not dir_path.endswith("datasets"):
            init_file = os.path.join(full_path, "__init__.py")
            if not os.path.exists(init_file):
                with open(init_file, "w") as f:
                    pass
    
    # Create main app __init__.py
    app_init = os.path.join(base_dir, "__init__.py")
    if not os.path.exists(app_init):
        with open(app_init, "w") as f:
            pass

    print(f"✅ IIDPS Backend structure initialized successfully at {base_dir}")

if __name__ == "__main__":
    create_structure()
