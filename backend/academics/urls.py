from django.urls import path
from .views import (
    CourseListView, 
    StudentEnrollmentView,
    FacultyCourseListView, 
    CourseRosterView, 
    GradeUpdateView,
    SystemAnalyticsView,
    DailyAttendanceView # Add this line!
)

urlpatterns = [
    # Student Endpoints
    path('courses/', CourseListView.as_view(), name='course-list'),
    path('enroll/', StudentEnrollmentView.as_view(), name='student-enrollment'),
    
    # Faculty Endpoints
    path('faculty/courses/', FacultyCourseListView.as_view(), name='faculty-courses'),
    path('faculty/courses/<int:course_id>/roster/', CourseRosterView.as_view(), name='course-roster'),
    path('faculty/enrollment/<int:pk>/grade/', GradeUpdateView.as_view(), name='grade-update'),
    path('analytics/', SystemAnalyticsView.as_view(), name='system-analytics'),
    path('faculty/courses/<int:course_id>/attendance/<str:date>/', DailyAttendanceView.as_view(), name='daily-attendance'),
]