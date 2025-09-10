from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

# Best practice is one model per database table, so each model represents a table.
# Custom User Manager for creating users with hashed passwords
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

# User model
class User(AbstractBaseUser):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, default="")
    last_name = models.CharField(max_length=100, default="")
    birthdate = models.DateField()
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')])
    height_feet = models.CharField(max_length=10, default="")
    height_inches = models.CharField(max_length=10, default="")
    goal_weight = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    goal_to_lose_weight = models.BooleanField(default=False)
    goal_to_feel_better = models.BooleanField(default=False)

    # Django authentication fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    # Use the custom manager
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'birthdate', 'gender']

    def __str__(self):
        return f"User ID: {self.user_id}, Email: {self.email}"

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser
    
# UserData model
class UserData(models.Model):
    data_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    goal_type = models.CharField(max_length=20, choices=[('loseWeight', 'Lose Weight'), ('feelBetter', 'Feel Better'), ('both', 'Both')])
    weight_value = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    feel_better_value = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"Data for {self.user.email} at {self.timestamp}"
    
# NotificationData model
class NotificationData(models.Model):
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    notification_title = models.CharField(max_length=255, default="Default Title")
    notification_message = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    read_status = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification for {self.user.email} at {self.timestamp}"