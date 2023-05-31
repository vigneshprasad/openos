export const getLTVPrediction = (event: string, repeat: number, period:number) => {
    return [
        {
            heading: 'LTV Prediction (86% Model Certainty)',
            sheet: [
                [
                    {value: "Title"},
                    {value: "LTV"},
                ],
                [
                    { value: "Average" },
                    { value:  "984", unit: '₹', unitPrefix: true},
                ],
                [
                    { value: "Median" },
                    { value:  "1000", unit: '₹', unitPrefix: true},
                ],
                [
                    { value: "Top 10%" },
                    { value:  "2300", unit: '₹', unitPrefix: true},
                ],
                [
                    { value: "Top 90%" },
                    { value:  "100", unit: '₹', unitPrefix: true},
                ],
                [
                    { value: "Minimum Value" },
                    { value:  "0", unit: '₹', unitPrefix: true},
                ],
                [
                    { value: "Maximum Value" },
                    { value:  "2640", unit: '₹', unitPrefix: true},
                ],
            ],
            graph: {
                type: 'bar',
                labels: ["₹0", "₹0-₹500", "₹500-₹1000", "₹1000-₹1500", "₹1500-₹2000", "₹2000+"],
                data: [100, 200, 250, 150, 200, 100],
                title: "Lifetime Value"
            }
        },
        undefined
    ]
}

