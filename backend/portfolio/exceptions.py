from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        if isinstance(response.data, dict) and "error" not in response.data:
            detail = response.data.get("detail")
            if detail:
                response.data = {"error": str(detail)}
        return response
    return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
