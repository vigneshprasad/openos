export const getChurnPrediction = (event: string, repeat: number, period:number) => {
    return [
        {
            heading: 'Churn Prediction (84% Model Certainty)',
            sheet: [
                [
                    {value: "Title"},
                    {value: "Value"},
                ],
                [
                    { value: "Average Probabilty of churn" },
                    { value:  "33", unit: '%'},
                ],
                [
                    { value: "Median Probabilty of Churn" },
                    { value:  "35", unit: '%'},
                ],
                [
                    { value: "Average days to Churn" },
                    { value:  "6.5", },
                ],
                [
                    { value: "Risk Factor" },
                    { value:  "21", unit: '%'},
                ],
                [
                    { value: "Potential Loss in LTV" },
                    { value:  "87,500", unit: '₹', unitPrefix: true},
                ],
                [
                    { value: "Comparison to Average User" },
                    { value:  "Better Performant ➚", },
                ],
            ],
            graph: {
                type: 'bar',
                labels: ["0-20% chance", "20%-40% chance", "40%-60% chance", "60%-80% chance", "80%-100% chance"],
                data: [400, 275, 200, 225, 50],
                title: "No. of Users by Probability of Churn"
            }
        },
        undefined
    ]
}

