export const getMonthlyTimeSeries = (number: number, start?: Date | undefined): Date[] => {
    const startDate = start || new Date();
    const timeSeries: Date[] = [];
    timeSeries.push()
    for(let i=0; i < number; i++) {
        timeSeries.push(new Date(startDate.getFullYear(), startDate.getMonth() - i, 1));
    }
    timeSeries.reverse();
    return timeSeries;
}