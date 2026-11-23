import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

def create_app(test_config=None):
    load_dotenv()
    app = Flask(__name__)

    if test_config:
        app.config.update(test_config)

    # Enable CORS for frontend integration
    frontend_url = os.getenv("FRONTEND_URL", "*")
    CORS(app, resources={r"/api/*": {"origins": "*" if frontend_url == "*" else [frontend_url, "http://localhost:5173", "http://127.0.0.1:5173"]}})

    # Register routes
    from app.routes.api import api_bp
    app.register_blueprint(api_bp, url_prefix="/api")

    # Global error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad Request", "message": str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not Found", "message": "The requested resource was not found"}), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error occurred"}), 500

    return app

