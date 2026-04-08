from django.urls import path

from .views import (
    AdminAuthView,
    AdminLeadsListView,
    AdminPortfolioImagesListCreateView,
    AdminPortfolioListView,
    AdminPortfolioUpdateView,
    AdminProjectImageUpdateDeleteView,
    ContactSubmitView,
    PublicPortfolioView,
    PublicPortfolioDetailView,
)

urlpatterns = [
    path("api/contact", ContactSubmitView.as_view()),
    path("api/portfolio", PublicPortfolioView.as_view()),
    path("api/portfolio/<slug:slug>", PublicPortfolioDetailView.as_view()),
    path("api/admin/auth", AdminAuthView.as_view()),
    path("api/admin/leads", AdminLeadsListView.as_view()),
    path("api/admin/portfolio", AdminPortfolioListView.as_view()),
    path("api/admin/portfolio/<uuid:id>/", AdminPortfolioUpdateView.as_view()),
    # без завершающего слеша (иногда Next/rewrites отправляют так)
    path("api/admin/portfolio/<uuid:id>", AdminPortfolioUpdateView.as_view()),
    path("api/admin/portfolio/<uuid:id>/images", AdminPortfolioImagesListCreateView.as_view()),
    path("api/admin/portfolio/<uuid:id>/images/", AdminPortfolioImagesListCreateView.as_view()),
    path("api/admin/portfolio/images/<uuid:image_id>/", AdminProjectImageUpdateDeleteView.as_view()),
    path("api/admin/portfolio/images/<uuid:image_id>", AdminProjectImageUpdateDeleteView.as_view()),
]

