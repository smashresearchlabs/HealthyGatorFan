
class User {
    // Class members (properties and methods) go here
    userId: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate: string; //A string is used to define the date here so it can be inside a navigation state
    gender: string;
    heightFeet: number;
    heightInches: number;
    currentWeight: number;

    //Goal-Related Data
    feelBetter: boolean;
    loseWeight: boolean;
    goalWeight: number;

    goal_to_feel_better: boolean;
    goal_to_lose_weight: boolean;

    goalType: string;

    lastRating: number;


    constructor(userId: number, email: string, password: string, fName: string, lName: string, bDate: string, gender: string, hFeet: number, hInches: number, cWeight: number, feelBetter:boolean, loseWeight: boolean, goalWeight: number, goalType: string, lastRating: number) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.firstName = fName;
        this.lastName = lName;
        this.birthDate = bDate;
        this.gender = gender;
        this.heightFeet = hFeet;
        this.heightInches = hInches;
        this.currentWeight = cWeight;
        this.feelBetter = feelBetter;
        this.loseWeight = loseWeight;
        this.goalWeight = goalWeight;

        this.goal_to_feel_better = this.feelBetter;
        this.goal_to_lose_weight = this.loseWeight;

        this.goalType = goalType;

        this.lastRating = lastRating;

    }

    //Used to solve nesting issues within screens. Essentially a copy constructor.
    cloneUser(){
        return new User(this.userId, this.email, this.password, this.firstName, this.lastName, this.birthDate, this.gender, this.heightFeet, this.heightInches, this.currentWeight, this.feelBetter, this.loseWeight, this.goalWeight, this.goalType, this.lastRating);
    }

}

export default User;