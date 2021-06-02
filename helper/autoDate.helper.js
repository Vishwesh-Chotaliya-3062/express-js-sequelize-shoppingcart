exports.dateAfterDays = (days= 1) => {
    const now = new Date();
    const dateAfterDays = new Date(now.setDate(now.getDate() + days));
    return dateAfterDays;
};

exports.dateAfterWeeks = (weeks= 1) => {
    const now = new Date();
    const dateAfterWeeks = new Date(now.setDate(now.getDate() + 7*weeks));
    return dateAfterWeeks;
};

exports.dateAfterMonths = (months= 1) => {
    const now = new Date();
    const dateAfterMonths = new Date(now.setMonth(now.getMonth() + months));
    return dateAfterMonths;
};

exports.dateAfterYears = (years= 1) => {
    const now = new Date();
    const dateAfterYears = new Date(now.setFullYear(now.getFullYear + years));
    return dateAfterYears;
};