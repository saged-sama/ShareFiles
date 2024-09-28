export const getCurrentConfig = () => {
    let configString = localStorage.getItem("config");
    if(!configString) {
        return null;
    }
    let config: App.Configurations = JSON.parse(configString);
    return config;
}

export const sizeCalculator = (size: number) => {
    if(size < 1024) {
        return `${size} B`;
    } else if(size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    } else if(size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    } else {
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
}

export const getTime = (time: number) => {
    if(time < 60) {
        return `${Math.round(time)} sec`;
    } else if(time < 60 * 60) {
        return `${Math.floor(time / 60)} min ${Math.round(time % 60)} sec`;
    }
    else if(time < 60 * 60 * 24) {
        return `${Math.floor(time / (60 * 60))} hr ${Math.round((time % (60 * 60)) / 60)} min`;
    }
    else if(time < 60 * 60 * 24 * 30) {
        return `${Math.floor(time / (60 * 60 * 24))} days ${Math.round((time % (60 * 60 * 24)) / (60 * 60))} hr`;
    }
    else if(time < 60 * 60 * 24 * 30 * 12) {
        return `${Math.floor(time / (60 * 60 * 24 * 30))} months ${Math.round((time % (60 * 60 * 24 * 30)) / (60 * 60 * 24))} days`;
    }
    else {
        return `${Math.floor(time / (60 * 60 * 24 * 30 * 12))} years ${Math.round((time % (60 * 60 * 24 * 30 * 12)) / (60 * 60 * 24 * 30))} months`;
    }   
}