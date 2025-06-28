import logging

user_logger = logging.getLogger('userlog')

def log_user_action(request, action="", detail=""):
    user = request.session.get("username", "Guest")
    role = request.session.get("role", "Guest")
    method = request.method
    path = request.get_full_path()

    user_logger.info(f"{role} {user} - {method} {path} - {action} - {detail}")