from django.shortcuts import render
from rest_framework import viewsets, permissions,status
from .models import Category, Account, Transaction
from .serializers import CategorySerializer, AccountSerializer, TransactionSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView



# Create your views here.
class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Account.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user).order_by('-date')
        category = self.request.query_params.get('category')
        type_ = self.request.query_params.get('type')
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')

        if category:
            queryset = queryset.filter(category_id=category)
        if type_:
            queryset = queryset.filter(type=type_)
        if start:
            queryset = queryset.filter(date__gte=start)
        if end:
            queryset = queryset.filter(date__lte=end)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username taken'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password)
    return Response({'message': 'User created'}, status=status.HTTP_201_CREATED)        
class MonthlySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = (
            Transaction.objects.filter(user=request.user)
            .annotate(month=TruncMonth('date'))
            .values('month', 'type')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )
        return Response(data)


class CategorySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = (
            Transaction.objects.filter(user=request.user, type='expense')
            .values('category__name')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )
        return Response(data)