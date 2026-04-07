from django.urls import path
from .views import (
    CourseListView, 
    StudentEnrollmentView,
    FacultyCourseListView, 
    CourseRosterView, 
    GradeUpdateView,
    SystemAnalyticsView,
    DailyAttendanceView,
    TranscriptPDFView,
    NotificationListView,
    MarkNotificationReadView
)

urlpatterns = [
    path('courses/', CourseListView.as_view(), name='course-list'),
    path('enroll/', StudentEnrollmentView.as_view(), name='student-enrollment'),
    path('transcript/download/', TranscriptPDFView.as_view(), name='download-transcript'),
    
    path('faculty/courses/', FacultyCourseListView.as_view(), name='faculty-courses'),
    path('faculty/courses/<int:course_id>/roster/', CourseRosterView.as_view(), name='course-roster'),
    path('faculty/enrollment/<int:pk>/grade/', GradeUpdateView.as_view(), name='grade-update'),
    path('faculty/courses/<int:course_id>/attendance/<str:date>/', DailyAttendanceView.as_view(), name='daily-attendance'),
    
    path('analytics/', SystemAnalyticsView.as_view(), name='system-analytics'),
    
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-read'),
]