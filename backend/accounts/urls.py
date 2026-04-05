from django.urls import path
from .views import UserRoleView

urlpatterns = [
    path('me/', UserRoleView.as_view(), name='user-role'),
]