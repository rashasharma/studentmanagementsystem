from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import UserRoleView

urlpatterns = [
    # This magically handles the username/password and creates the JWT Token!
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # This points to the custom view you already have to check the Role
    path('me/', UserRoleView.as_view(), name='user_role'),
]