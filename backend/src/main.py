import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.endpoints import app

if __name__ == "__main__":
    print("Starting Flask server...")
    print("Available routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.endpoint}: {rule.rule}")
    
    app.run(debug=True, host="0.0.0.0", port=5000)