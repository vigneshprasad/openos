export const getLikelihoodEvent = (event: string, event2: string, period:number) => {
    return [
        {
            heading: `Likelihood of ${event2} (96% Model Certainty)`,
            sheet: [
                [
                    {value: "Title"},
                    {value: "Likelihood"},
                ],
                [
                    { value: `Average Likelihood of ${event2}` },
                    { value:  "95", unit: '%'},
                ],
                [
                    { value: `Confidence Interval` },
                    { value:  "+- 2", unit: '%'},
                ],
                [
                    { value: `Average days to perform ${event2}` },
                    { value:  "5", },
                ],
                [
                    { value: `Median days to perform ${event2}` },
                    { value:  "6", },
                ],
                [
                    { value: `Users who didn't perform ${event2}` },
                    { value:  "6350"},
                ],
                [
                    { value: "Correlation Between Events" },
                    { value:  "Very High ➚", },
                ],
            ],
            graph: {
                type: 'bar',
                labels: ["0-3", "3-6", "6-9", "9-12", "12-15"],
                data: [10, 17, 25, 13, 20, 5],
                title: `Days to ${event2}`
            }
        },
        undefined
    ]
}

