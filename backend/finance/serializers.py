from rest_framework import serializers
from .models import Category, Account, Transaction, Budget
from decimal import Decimal
from django.db.models import Sum


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class AccountSerializer(serializers.ModelSerializer):
    balance = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['id', 'name',
                  'opening_balance',
                  'balance'
                ]
    def get_balance(self, obj):
            income = Transaction.objects.filter(
            user=obj.user,
            account=obj,
            type='income'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            expenses = Transaction.objects.filter(
            user=obj.user,
            account=obj,
            type='expense'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            return obj.opening_balance + income - expenses


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'account', 'account_name', 'category', 'category_name',
            'amount', 'type', 'note', 'date', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    spent_amount = serializers.SerializerMethodField()
    def get_spent_amount(self, obj):
     from django.db.models import Sum

     total = Transaction.objects.filter(
        user=obj.user,
        category=obj.category,
        type='expense',
        date__month=obj.month,
        date__year=obj.year
    ).aggregate(total=Sum('amount'))['total']

     return total or 0
    class Meta:
        model = Budget
        fields = [
            'id',
            'category',
            'category_name',
            'amount',
            'spent_amount',
            'month',
            'year'
        ]
        read_only_fields = ['id']

    def validate_category(self, value):
        user = self.context['request'].user

        if value.user != user:
            raise serializers.ValidationError(
                "You can only select your own categories."
            )

        return value
    def validate_amount(self, value):
     if value <= 0:
        raise serializers.ValidationError(
            "Budget amount must be greater than zero."
        )

     return value 
    def validate_month(self, value):
     if value < 1 or value > 12:
        raise serializers.ValidationError(
            "Month must be between 1 and 12."
        )
     return value


    def validate_year(self, value):
     if value < 2000:
        raise serializers.ValidationError(
            "Please enter a valid year."
        )
     return value     