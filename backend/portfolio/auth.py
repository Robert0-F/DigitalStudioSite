from rest_framework import authentication


class AdminCookieAuthentication(authentication.BaseAuthentication):
    """
    Простейшая авторизация по cookie.
    Cookie ставится эндпоинтом /api/admin/auth в Django.
    """

    def authenticate(self, request):
        cookie_val = request.COOKIES.get("admin_session")
        if cookie_val == "1":
            return (object(), None)
        return None

