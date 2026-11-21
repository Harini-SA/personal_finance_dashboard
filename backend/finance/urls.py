from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, AccountViewSet, TransactionViewSet, BudgetViewSet,register,MonthlySummaryView, CategorySummaryView
from django.urls import path

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('accounts', AccountViewSet, basename='account')
router.register('transactions', TransactionViewSet, basename='transaction')
router.register('budgets', BudgetViewSet, basename='budget')


urlpatterns = router.urls + [
    path('register/', register, name='register'),
     path('summary/monthly/', MonthlySummaryView.as_view(), name='monthly-summary'),
    path('summary/category/', CategorySummaryView.as_view(), name='category-summary'),
]