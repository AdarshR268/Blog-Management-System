from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PostViewSet, PostCommentsView, CommentDetailView,
    LoginView, LogoutView, UserView, AnalyticsView
)

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')

urlpatterns = [
    # Auth Endpoints
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/user/', UserView.as_view(), name='auth_user'),

    # Comments Endpoints
    path('posts/<int:post_id>/comments/', PostCommentsView.as_view(), name='post_comments'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment_detail'),

    # Analytics Endpoint
    path('analytics/', AnalyticsView.as_view(), name='analytics'),

    # Include viewset routes (posts)
    path('', include(router.urls)),
]
