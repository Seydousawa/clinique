from rest_framework import serializers
from .models import Personnel
from django.contrib.auth import get_user_model
from user.models import Role

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    role_nom = serializers.CharField(write_only=True, required=False)
    role = serializers.CharField(source="role.nom", read_only=True)
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = ["id", "nom", "prenom", "email", "telephone", "username", "password", "role_nom", "role", "is_active"]
        extra_kwargs = {
            "password": {"write_only": True, "required": False},
        }

    def create(self, validated_data):
        role_nom = validated_data.pop("role_nom", None)
        password = validated_data.pop("password", None)
        
        if role_nom:
            try:
                role = Role.objects.get(nom=role_nom)
                validated_data["role"] = role
            except Role.DoesNotExist:
                raise serializers.ValidationError(f"Le rôle '{role_nom}' n'existe pas.")

        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        role_nom = validated_data.pop("role_nom", None)
        password = validated_data.pop("password", None)

        if role_nom:
            try:
                role = Role.objects.get(nom=role_nom)
                instance.role = role
            except Role.DoesNotExist:
                raise serializers.ValidationError(f"Le rôle '{role_nom}' n'existe pas.")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class PersonnelSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    id = serializers.IntegerField(source='user.id', read_only=True)
    # Ajouter les champs de soft delete
    is_deleted = serializers.BooleanField(read_only=True)
    deleted_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Personnel
        fields = ["id", "user", "is_deleted", "deleted_at"]

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        user = UserSerializer().create(user_data)
        personnel = Personnel.objects.create(user=user, **validated_data)
        return personnel

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        
        if user_data:
            user_serializer = UserSerializer()
            user_serializer.update(instance.user, user_data)
        
        return instance