from rest_framework import serializers
from .models import User, UserData, NotificationData

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ['user_id', 'email']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = ['data_id', 'user', 'timestamp', 'goal_type', 'weight_value', 'feel_better_value']
        read_only_fields = ['data_id', 'timestamp']

class NotificationDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationData
        fields = '__all__'