from rest_framework import serializers
from .models import UserData, User, NotificationData

import logging

# Serializes models to JSON for the front end
# Deserializes and validates data from the front end, then saves it to the database

# Best practice is one serializer per model

# Serializer for User
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__' #['user_id', 'email', 'password', 'first_name', 'last_name', 'birthdate', 'gender', 'height_feet', 'height_inches', 'goal_weight', 'goal_to_lose_weight', 'goal_to_feel_better']
        # required fields in models.py, but these are overidden temporarily
        extra_kwargs = {
            'birthdate': {'required': False, 'default': "2000-01-01"},
            'gender': {'required': False, 'default': "Other"},
            'first_name': {'required': False, 'default': ''},
            'last_name': {'required': False, 'default': ''},
            'height_feet': {'required': False, 'default': 0},
            'height_inches': {'required': False, 'default': 0},
            'goal_weight': {'required': False, 'default': 0.0},
            'goal_to_lose_weight': {'required': False, 'default': 0.0},
            'goal_to_feel_better': {'required': False, 'default': 0.0},
        }

    def create(self, validated_data):
        return User.objects.create(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name = validated_data['first_name'],
            last_name = validated_data['last_name'],
            birthdate=validated_data['birthdate'],
            gender=validated_data['gender'],
            height_feet=validated_data['height_feet'],
            height_inches=validated_data['height_inches'],
            goal_weight=validated_data['goal_weight'],
            goal_to_lose_weight=validated_data['goal_to_lose_weight'],
            goal_to_feel_better=validated_data['goal_to_feel_better']
        )
    
    def update(self, instance, validated_data):
        # Update fields when new data comes from the basicinfo.tsx screen
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.birthdate = validated_data.get('birthdate', instance.birthdate)
        instance.gender = validated_data.get('gender', instance.gender)
        instance.height_feet = validated_data.get('height_feet', instance.height_feet)
        instance.height_inches = validated_data.get('height_inches', instance.height_inches)
        instance.goal_weight = validated_data.get('goal_weight', instance.goal_weight)
        instance.goal_to_feel_better = validated_data.get('goal_to_feel_better', instance.goal_to_feel_better)
        instance.goal_to_lose_weight = validated_data.get('goal_to_lose_weight', instance.goal_to_lose_weight)
        instance.save()
        return instance

    
# Serializer for UserData
class UserDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserData
        fields = ['data_id', 'user', 'timestamp', 'goal_type', 'weight_value', 'feel_better_value']        
        extra_kwargs = {
            'goal_type': {'required': False},
            'weight_value': {'required': False, 'default': 0.0},
            'feel_better_value': {'required': False, 'default': 0.0}
        }

    def create(self, validated_data):
        return UserData.objects.create(
            goal_type=validated_data['goal_type'],
            weight_value=validated_data['weight_value'],
            feel_better_value=validated_data['feel_better_value'],
        )

    def update(self, instance, validated_data):
        # Update fields when new data comes from the basicinfo.tsx screen
        instance.goal_type = validated_data.get('goal_type', instance.goal_type)
        instance.weight_value = validated_data.get('weight_value', instance.weight_value)
        instance.feel_better_value = validated_data.get('feel_better_value', instance.feel_better_value)
        instance.save()
        return instance
    
# Serializer for NotificationData
class NotificationDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationData
        fields = '__all__'  # Or specify the fields you want to include
        # fields = ['user', 'notification_title','notification_message', 'read_status']