# HealthyGatorSportsFan
Senior Project / JITAI application 2024

<img src="HealthyGatorSportsFanRN/assets/images/clipboardgator.jpg" width="200" /><img src="HealthyGatorSportsFanRN/assets/images/coolgator.png" width="200" />

## Run the App: Simple Setup (recommended)
This process involves downloading our pre-packaged installation file for testing on a mobile device.
#### Option 1: Run on IOS Device 
If you want to test the application on an IOS device, follow the steps shown below.

##### If Public Link Approved (recommended)
- Download the “TestFlight” application on your mobile device.
- Open this link on your phone / testing device: https://testflight.apple.com/join/DgDEk74t
- Follow the prompts on your device, allow notifications if prompted.

##### If Public Link NOT Approved (APPROVED as of 12/3)
- Notify @lisareichelson@ufl.edu that you would like access to test our application. All we need is your email address to be able to grant you access.
- Check your email for an invitation. Create an account / follow the on-screen instructions. Eventually you should be prompted to download an application on your phone via testflight. Do so, and allow notifications if prompted.

  **ADMIN NOTES: navigate to [the user management screen](https://appstoreconnect.apple.com/access/users) to send an invitation to the requested email address.
Once they accept the invitation, go to [the tester management screen](https://appstoreconnect.apple.com/teams/6dbe8045-715d-454b-9898-d5f6c28236e9/apps/6738848648/testflight/groups/ee86f684-4ec1-4ec3-8697-fb92d0ffdd35) and add them as an approved tester. **

#### Option 2: Run on Android Device 
- Open this link on your phone / testing device: https://tsfr.io/join/j83v89
- Follow the instructions that appear on the screen. Install the application, allow notifications if prompted.


## Run the App: Advanced Setup (Recommended for development purposes only)

### Backend

#### Option 1: Run on Heroku (recommended)
This app runs on a Heroku server in production. No specific action is required to start up the backend if you plan on using Heroku.
- Index: https://healthygatorsportsfan-84ee3c84673f.herokuapp.com
- Django admin view: https://healthygatorsportsfan-84ee3c84673f.herokuapp.com/admin

#### Option 2: Run Locally (on Windows)
If you want to develop and test backend code changes locally, you can run the backend on ngrok, Django server, Redis server, Celery worker, and Celery beat scheduler. First you'll need to clone the repo and install the necessary prerequisites.

##### Step 0: Prerequisite downloads and installations

1. Install Python and Pip
   - Download the latest version of Python from https://www.python.org/downloads/ 
   - Ensure the latest version of pip is installed by running `py -m ensurepip –upgrade` in the terminal.

1. Install Django
   - You can install Django by running the command `python -m pip install Django` in the terminal. Instructions can be found here: https://docs.djangoproject.com/en/5.1/topics/install/#installing-official-release or here: https://docs.djangoproject.com/en/5.1/intro/install/#install-django.

1. Install PostgreSQL
    - Download https://www.postgresql.org/download/windows/.
    - In the terminal from the **HealthyGatorSportsFan** directory run `python -m pip install psycopg2`
    - Open pgAdmin4 (from Windows Start menu) and login with the password you made when downloading PostgreSQL.
        - Go to servers/login/grouproles. Right click and create a new role. Set the priviledges to allow “LOG IN”
        - Name it and set the password.
        - Right click databases and create “healthygatorsportsfan”. Set the owner to yourself.
    - Navigate to the **HealthyGatorSportsFanDjango** directory and run `python manage.py migrate` then `python manage.py createsuperuser?`
    - From the **HealthyGatorSportsFanDjango** directory run `python manage.py runserver`, and open the link. Navigate to http://localhost:8000/admin and log in with your superuser credentials.

1. Install CORS for Django
   - Navigate to the **HealthyGatorSportsFanDjango** directory and run `pip install django-cors-headers`. This allows for ExpoGo to connect to the local server on the backend
  
1. Install College Football Data API and other needed modules
   - Navigate to the **HealthyGatorSportsFanDjango** directory and run:
     - `python -m pip install cfbd==5.3.3a1` (click [here](https://github.com/CFBD/cfbd-python/tree/next?tab=readme-ov-file#installation--usage) for more information)
     - `python -m pip install pytz`
     - `python -m pip install exponent-server-sdk`

1. Install OpenAPI SARTBEAR Swagger generation tool for Django Rest Framework
   - Navigate to the **HealthyGatorSportsFanDjango** directory and run `pip install drf-yasg`

1. Set up Ngrok
   - Follow Steps 1-4 in these instructions: [Quickstart | ngrok documentation](https://ngrok.com/docs/getting-started/?os=windows). Use port 8000 instead of 8080. And be sure to create a static domain (step 4). Here is an excerpt with some tweaks for our use case:
     - **Step 1: Install** - Run this command in an Administrator Command Prompt: `choco install ngrok`, or [download the ngrok agent from their Download page](https://download.ngrok.com/) if you can't use one of the options above. The ngrok agent is a zero-dependency CLI program that runs on all major operating systems. Test that you installed it correctly by running `ngrok help` in your terminal and confirm that ngrok prints its help text.
     - **Step 2: Connect your account** - Next, connect your ngrok agent to your ngrok account. If you haven't already, sign up for an ngrok account. Copy your ngrok authtoken from your ngrok dashboard. Run the following command in your terminal to install the authtoken and connect the ngrok agent to your account: `ngrok config add-authtoken <TOKEN>`
     - **Step 3: Put your app online** - Start ngrok by running the following command: `ngrok http http://localhost:8000`(NOTE: The tutorial calls for port 8080, but this app run locally uses port 8000). You will see something similar to the following console UI in your terminal. Open the Forwarding URL in your browser and you will see your web application. This URL is available to anyone on the internet. Test it out by sending it to a friend! Your app is available over HTTPS (notice the 🔒 in your browser window) with a valid certificate that ngrok automatically manages for you.
       ```
            ngrok                                                                   (Ctrl+C to quit)
            
            Session Status                online
            Account                       inconshreveable (Plan: Free)
            Version                       3.0.0
            Region                        United States (us)
            Latency                       78ms
            Web Interface                 http://127.0.0.1:4040
            Forwarding                    https://84c5df474.ngrok-free.dev -> http://localhost:8080
            
            Connections                   ttl     opn     rt1     rt5     p50     p90
                                          0       0       0.00    0.00    0.00    0.00
        ```
     - **Step 4: Always use the same domain** - If you want to keep the same URL each time you use ngrok (NOTE: You will), create a static domain on your dashboard and then use the --url flag to ask the ngrok agent to use it. First, stop ngrok with Ctrl+C and then run ngrok again: `ngrok http 8000 --url <your new static domain>`. Use this link to get to your dashboard once set up: https://dashboard.ngrok.com/
   - Navigate to **HealthyGatorSportsFanDjango\project\settings.py** and add your new static domain to ALLOWED_HOSTS and CSRF_TRUSTED_ORIGIN.
   - Navigate to **HealthyGatorSportsFanRN\constants\AppUrls.ts**, add your new static domain to the list. Comment out other URLs in the list. This will ensure the frontend uses this host for API calls.

1. Install Celery and Redis
   - Open a terminal in your virtual environment and run: 'python -m pip install celery redis'. This installs Celery (the task queue) and Redis (the message broker).   

1. Download Redis for Windows
   - Download the .msi file (not the zip) from the [official source](https://github.com/microsoftarchive/redis/releases) and double click on it to run the installer. 

Once you've completed the prerequisites, you're ready to run the application by following these steps:

##### Step 1. Run the Django server

Be sure you've already completed the following steps specified in the pre-requisites:
   - Navigate to **HealthyGatorSportsFanDjango\project\settings.py** and add your new static domain to ALLOWED_HOSTS and CSRF_TRUSTED_ORIGIN.
   - Navigate to **HealthyGatorSportsFanRN\constants\AppUrls.ts**, add your new static domain to the list. Comment out other URLs in the list. This will ensure the frontend uses this host for API calls.

In a terminal, navigate to **HealthyGatorSportsFanDjango** directory  and run `ngrok http 8000 --url <your new static domain>`. 

##### Step 2. Run the Django server

In a terminal, navigate to the **HealthyGatorSportsFanDjango** directory and run `python manage.py runserver 0.0.0.0:8000`. You should see something like this in the terminal:

<img width="881" alt="image" src="https://github.com/user-attachments/assets/ea048a5a-5931-4690-8865-2418a4a461a1">

Now you can open the following links in your browser to view the index of entities and manage your Django app as an admin:
- Index: http://localhost:8000
- Django admin view: http://localhost:8000/admin

> [!NOTE]  
> When running the backend locally, you will be using a local instance of a PostgreSQL database. Data stored here will differ than the one used by Heroku.

##### Step 3: Run the Redis-Server
Open a terminal as admin (you’ll need root privileges) and navigate to the directory where Redis is installed (i.e. **C:\Program Files\Redis**). Run `redis-server` in the terminal. 

> [!WARNING]
> You may get this known issue in Windows when running the command: `# Creating Server TCP listening socket *:6379: No such file or directory`. If this happens, run `redis-cli.exe` from the Redis directory, then run > > `shutdown` while that is executing. Run `ctrl+c` to exit the executable, then re-run  `redis-server` again and it should work. Your terminal should look something like this: 
> <img width="1117" alt="image" src="https://github.com/user-attachments/assets/604611da-5681-42f2-84d8-e9cfbb38c687">

##### Step 4: Run the Celery worker
Open a new terminal and navigate to the **HealthyGatorSportsFanDjango** directory. Start the Celery worker by running `celery -A project worker --pool=solo -l info`. This command starts the Celery worker, which polls Redis for new tasks. The `--pool=solo` forces things to become single threaded so it can work on Windows. 

##### Step 5: Run the Celery beat scheduler
Open a new terminal and navigate to the **HealthyGatorSportsFanDjango** directory. Start the celery beat scheduler by running `celery -A project beat --loglevel=info`. This command starts the Celery beat scheduler, which sends tasks to the message broker (in this case, Redis) at set intervals, e.g., every 10 seconds.

Now the backend should be up and running locally!

### Frontend
This section is still under construction.

#### Option 1: Run using TestFlight
(TODO: Complete this section)

#### Option 2: Run locally using Expo Go

##### Step 0: Prerequisite downloads and installations

In the **HealthyGatorSportsFanRN** run:
- `npx expo start`

- ##### Step 1: Prerequisite downloads and installations

Navigate to the **HealthyGatorSportsFanRN** directory and run the following:
- `npm install`
- `npx expo install react-native-web`
- `npx expo install expo-web-browser`

#### Option 3: Run locally using Expo Development Build
(TODO: Complete this section)

##### Step 0: Prerequisite downloads and installations

HealthyGatorSportsFan is organized into two primary directories: **HealthyGatorSportsFanDjango** for the Django-powered backend code, and **HealthyGatorSportsFanRN** for the React Native frontend code.

### Backend

Database entities for User, UserData, and NotificationData are defined in HealthyGatorSportsFanDjango/app/models.py.

APIs are defined in the backend in [HealthyGatorSportsFanDjango/app/views.py](HealthyGatorSportsFanDjango/app/views.py)

API URLs are captured in [HealthyGatorSportsFanDjango/project/urls.py](HealthyGatorSportsFanDjango/project/urls.py)

Thse REST APIs are documented in our [Swagger](https://healthygatorsportsfan-84ee3c84673f.herokuapp.com/swagger/).

Heroku, Django, Expo SDK 52, ReactNative...


Django Index:

<img width="443" alt="image" src="https://github.com/user-attachments/assets/1160bd37-580e-45e6-819a-b3787e96793e">

Django Admin View:

<img width="559" alt="image" src="https://github.com/user-attachments/assets/61943fa6-eeb2-42fc-a535-43b57581c5ac">
