from django.db import models
from django.contrib.auth.hashers import check_password as django_check_password

# Create your models here.

# Best practice is one model per database table, so each model represents a table.

# User model
class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, default="")
    last_name = models.CharField(max_length=100, default="")
    birthdate = models.DateField()
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')]) # The first value is the value stored in the DB, and the second value is the label displayed on the UI
    height_feet = models.CharField(max_length=10, default="")
    height_inches = models.CharField(max_length=10, default="")
    goal_weight = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)  # Weight in pounds
    goal_to_lose_weight = models.BooleanField(default=False)
    goal_to_feel_better = models.BooleanField(default=False)
    password = models.CharField(max_length=128, blank=True, null=True)  # Optional if signing in with Google
    #google_acct_id = models.CharField(max_length=255, blank=True, null=True)  # Optional if creating an account directly

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_id', 'first_name', 'last_name', 'birthdate', 'gender', 'height_feet', 'height_inches', 'goal_weight', 'goal_to_lose_weight', 'goal_to_feel_better', 'password']  # Add any additional required fields here

    # When an instance is referenced, prints the user ID and name instead of the default "User object (1)"
    def __str__(self):
        return f"User ID: {self.user_id}, Email: {self.email}"

    def check_password(self, password_entered):
        if (password_entered == self.password):
            return True
        else:
            return False
        
# UserData model
class UserData(models.Model):
    data_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Foreign key to User, CASCADE -> all related UserData instances will be deleted if User is deleted
    timestamp = models.DateTimeField(auto_now_add=True)  # Automatically sets the field to the current date and time
    goal_type = models.CharField(max_length=20, choices=[('loseWeight', 'Lose Weight'), ('feelBetter', 'Feel Better'), ('both', 'Both')]) # The first value is the value stored in the DB, and the second value is the label displayed on the UI
    weight_value = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)  # Weight in pounds (optional, depends on goal type)
    feel_better_value = models.IntegerField(null=True, blank=True)  # Scale of 1 to 5 (optional, depends on goal type)

    # When an instance is referenced, prints the user name and timestamp instead of the default "User object (1)"
    def __str__(self):
        return f"Data for {self.user.email} at {self.timestamp}"
    
# NotificationData model
class NotificationData(models.Model):
    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Foreign key to User, CASCADE -> all related NotificationData instances will be deleted if User is deleted
    notification_title = models.CharField(max_length=255, default="Default Title")
    notification_message = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)  # Automatically sets the field to the current date and time
    read_status = models.BooleanField(default=False)

     # When an instance is referenced, prints the user name and timestamp instead of the default "User object (1)"
    def __str__(self):
        return f"Notification for {self.user.email} at {self.timestamp}"
    

    
