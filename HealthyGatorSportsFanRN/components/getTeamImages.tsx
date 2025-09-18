/*
This file is used to manage dynamic image loading for opposing teams.
Ensure to load all possible opponents into this file
 */

// TODO: Add all remaining college abbreviations from HealthyGatorSportsFanRN\constants\Abbreviations.ts to this file
    // Can limit this to only the team UF will play.

interface Image {
    name: string;
    image: any;
}

export class TeamLogo {
    private static images: Array<Image> = [
        {
            name: 'fla', //florida
            image: require('../assets/images/teamLogos/gatorlogo.png'),
        },
        {
            name: 'fsu', //florida state university
            image: require('../assets/images/teamLogos/fsu.png'),
        },
        {
            name: 'uga', //university of georgia
            image: require('../assets/images/teamLogos/uga.png'),
        },
        {
            name: 'lsu', //louisiana state university
            image: require('../assets/images/teamLogos/lsu.png'),
        },
        {
            name: 'uk', //university of kentucky
            image: require('../assets/images/teamLogos/uk.png'),
        },
        {
            name: 'van', //university of vanderbilt
            image: require('../assets/images/teamLogos/uv.png'),
        },
        {
            name: 'utk', //university of tennessee knoxville <-- this one doesn't seem to be in the CFBD API
            image: require('../assets/images/teamLogos/utk.jpg'),
        },
        {
            name: 'usc', //university of south carolina
            image: require('../assets/images/teamLogos/usc.png'),
        },
        {
            name: 'miz', //university of Missouri
            image: require('../assets/images/teamLogos/mu.png'),
        },
        {
            name: 'ta&m', //texas A & M
            image: require('../assets/images/teamLogos/a&m.png'),
        },
        {
            name: 'liu', //long island university
            image: require('../assets/images/teamLogos/liu.png'),
        },
        {
            name: 'usf', //university of south florida
            image: require('../assets/images/teamLogos/usf.png'),
        },
        {
            name: 'mia', //university of miami
            image: require('../assets/images/teamLogos/mia.png'),
        },
        {
            name: 'tex', //university of texas
            image: require('../assets/images/teamLogos/tex.png'),
        },
        {
            name: 'msst', //mississippi state university
            image: require('../assets/images/teamLogos/msst.png'),
        },
        {
            name: 'miss', //university of mississippi
            image: require('../assets/images/teamLogos/miss.png'),
        },
        {
            name: 'tenn', //university of tennessee
            image: require('../assets/images/teamLogos/tenn.png'),
        },
    ];

    static GetImage = (name: string) => {
        const found = TeamLogo.images.find(e => e.name === name);
        return found ? found.image : null;
    };
}