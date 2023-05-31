export const getModelCorrelation = (event: string, event2: string, period:number) => {
    return [
        {
            heading: `Correlation ${event2} and ${event} (98% Model Certainty)`,
            sheet: [
                [
                    {value: "Title"},
                    {value: "Value"},
                ],
                [
                    { value: `Correlation` },
                    { value:  "0.95" },
                ],
                [
                    { value: "Events Observed" },
                    { value:  "26312"},
                ],
                [
                    { value: "Events Not Correlated" },
                    { value:  "1254", },
                ],
                [
                    { value: "Event Occuring More Frequently" },
                    { value:  event },
                ],
                [
                    { value: `Likelihood of ${event2} if not ${event}` },
                    { value: "20", unit: "%"},
                ],
            ],
            // graph: {
            //     type: 'line',
            //     labels: ["₹0", "₹0-₹500", "₹500-₹1000", "₹1000-₹1500", "₹1500-₹2000", "₹2000+"],
            //     data: [100, 200, 250, 150, 200, 100],
            //     title: "Lifetime Value"
            // }
        },
        undefined
    ]
}

