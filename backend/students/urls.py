from django.urls import path
from .views import StudentProfileDetailView

urlpatterns = [
    path('profile/', StudentProfileDetailView.as_view(), name='student-profile'),
]