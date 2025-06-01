def user_context(request):
    print(request.session.items())
    return {
        'username': request.session.get('username'),
        'nama': request.session.get('nama'),
        'role': request.session.get('role')
    }