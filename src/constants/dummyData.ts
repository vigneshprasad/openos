import { PREMADE_MODEL } from "./modelTypes"

export const userAcquisitionData = 
[
    {
      "sheet": [
        [
          {"value": "Name"},
          {"value": "Tue May 31 2022"},
          {"value": "Thu Jun 30 2022"},
          {"value": "Sun Jul 31 2022"},
          {"value": "Wed Aug 31 2022"},
          {"value": "Fri Sep 30 2022"},
          {"value": "Mon Oct 31 2022"},
          {"value": "Wed Nov 30 2022"},
          {"value": "Sat Dec 31 2022"},
          {"value": "Tue Jan 31 2023"},
          {"value": "Tue Feb 28 2023"},
          {"value": "Fri Mar 31 2023"},
          {"value": "Sun Apr 30 2023"},
          {"value": "Projection - Tue May 30 2023"},
          {"value": "Projection - Thu Jun 29 2023"},
          {"value": "Projection - Sun Jul 30 2023"}
        ],
        [
          {
            "hint": "SELECT COUNT(*) FROM public.user \nWHERE created_at BETWEEN '<DATE-1>' AND '<DATE-2>' AND source IS NULL",
            "value": "Organic Acquisition"
          },
          {"value": 36},
          {"value": 35},
          {"value": 45},
          {"value": 27},
          {"value": 33},
          {"value": 56},
          {"value": 67},
          {"value": 26},
          {"value": 29},
          {"value": 34},
          {"value": 25},
          {"value": 46},
          {"value": 31},
          {"value": 36},
          {"value": 39},
        ],
        [
          {"value": "Growth %"},
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "-2.7"
          },
          {
            "unit": "%",
            "value": "28.6"
          },
          {
            "unit": "%",
            "value": "-40.0"
          },
          {
            "unit": "%",
            "value": "22.2"
          },
          {
            "unit": "%",
            "value": "69.7"
          },
          {
            "unit": "%",
            "value": "19.6"
          },
          {
            "unit": "%",
            "value": "-61.2"
          },
          {
            "unit": "%",
            "value": "11.5"
          },
          {
            "unit": "%",
            "value": "17.2"
          },
          {
            "unit": "%",
            "value": "-26.5"
          },
          {
            "unit": "%",
            "value": "84.0"
          }
        ],
        [
          {
            "hint": "SELECT COUNT(*) AS total_users \nFROM public.user \nWHERE source = 'Facebook' AND created_at BETWEEN '<DATE-1>' AND '<DATE-2>'",
            "value": "Facebook Acquisition"
          },
          {"value": 27},
          {"value": 33},
          {"value": 28},
          {"value": 40},
          {"value": 52},
          {"value": 36},
          {"value": 42},
          {"value": 29},
          {"value": 52},
          {"value": 34},
          {"value": 40},
          {"value": 34},
          {"value": 43},
          {"value": 42},
          {"value": 47},
        ],
        [
          {"value": "Growth %"},
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "22.2"
          },
          {
            "unit": "%",
            "value": "-15.2"
          },
          {
            "unit": "%",
            "value": "42.9"
          },
          {
            "unit": "%",
            "value": "30.0"
          },
          {
            "unit": "%",
            "value": "-30.8"
          },
          {
            "unit": "%",
            "value": "16.7"
          },
          {
            "unit": "%",
            "value": "-31.0"
          },
          {
            "unit": "%",
            "value": "79.3"
          },
          {
            "unit": "%",
            "value": "-34.6"
          },
          {
            "unit": "%",
            "value": "17.6"
          },
          {
            "unit": "%",
            "value": "-15.0"
          }
        ],
        [
          {
            "hint": "SELECT COUNT(*) AS total_users \nFROM public.user \nWHERE source = 'Google' AND created_at BETWEEN '<DATE-1>' AND '<DATE-2>'",
            "value": "Google Acquisition"
          },
          {"value": 0},
          {"value": 0},
          {"value": 0},
          {"value": 0},
          {"value": 0},
          {"value": 0},
          {"value": 0},
          {"value": 0},
          {"value": 0},
          {"value": 0},
          {"value": 0},
          {"value": 0}
        ],
        [
          {"value": "Growth %"},
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "NaN"
          }
        ],
        [
          {"value": "Other Acquisition"},
          {"value": 87},
          {"value": 51},
          {"value": 27},
          {"value": 31},
          {"value": 25},
          {"value": 42},
          {"value": 23},
          {"value": 34},
          {"value": 29},
          {"value": 22},
          {"value": 19},
          {"value": 66},
          {"value": 25},
          {"value": 23},
          {"value": 21}
        ],
        [
          {"value": "Growth %"},
          {
            "unit": "%",
            "value": "Infinity"
          },
          {
            "unit": "%",
            "value": "-41.38"
          },
          {
            "unit": "%",
            "value": "-47.06"
          },
          {
            "unit": "%",
            "value": "14.81"
          },
          {
            "unit": "%",
            "value": "-19.35"
          },
          {
            "unit": "%",
            "value": "68.00"
          },
          {
            "unit": "%",
            "value": "-45.24"
          },
          {
            "unit": "%",
            "value": "47.83"
          },
          {
            "unit": "%",
            "value": "-14.71"
          },
          {
            "unit": "%",
            "value": "-24.14"
          },
          {
            "unit": "%",
            "value": "-13.64"
          },
          {
            "unit": "%",
            "value": "247.37"
          }
        ],
        [
          {
            "hint": "SELECT COUNT(*) FROM public.user WHERE created_at BETWEEN '<DATE-1>' and '<DATE-2>'",
            "value": "Total Acquisition"
          },
          {"value": "150"},
          {"value": "119"},
          {"value": "100"},
          {"value": "98"},
          {"value": "110"},
          {"value": "134"},
          {"value": "132"},
          {"value": "89"},
          {"value": "110"},
          {"value": "90"},
          {"value": "84"},
          {"value": "146"},
          {"value": "94"},
          {"value": "101"},
          {"value": "107"}
        ],
        [
          {"value": "Organic as a % of total"},
          {
            "unit": "%",
            "value": "24.00"
          },
          {
            "unit": "%",
            "value": "29.40"
          },
          {
            "unit": "%",
            "value": "45.00"
          },
          {
            "unit": "%",
            "value": "27.55"
          },
          {
            "unit": "%",
            "value": "30.00"
          },
          {
            "unit": "%",
            "value": "41.79"
          },
          {
            "unit": "%",
            "value": "50.75"
          },
          {
            "unit": "%",
            "value": "29.20"
          },
          {
            "unit": "%",
            "value": "26.36"
          },
          {
            "unit": "%",
            "value": "37.78"
          },
          {
            "unit": "%",
            "value": "29.76"
          },
          {
            "unit": "%",
            "value": "31.51"
          }
        ]
      ],
      "heading": "User Acquisition"
    },
    null
]

export const userActivationData = 
[
    {
      "sheet": [
        [
          {"value": "Name"},
          {"value": "Tue May 31 2022"},
          {"value": "Thu Jun 30 2022"},
          {"value": "Sun Jul 31 2022"},
          {"value": "Wed Aug 31 2022"},
          {"value": "Fri Sep 30 2022"},
          {"value": "Mon Oct 31 2022"},
          {"value": "Wed Nov 30 2022"},
          {"value": "Sat Dec 31 2022"},
          {"value": "Tue Jan 31 2023"},
          {"value": "Tue Feb 28 2023"},
          {"value": "Fri Mar 31 2023"},
          {"value": "Sun Apr 30 2023"},
          {"value": "Projection - Tue May 30 2023"},
          {"value": "Projection - Thu Jun 29 2023"},
          {"value": "Projection - Sun Jul 30 2023"}
        ],
        [
          {
            "query": {
              "id": "clh1swibv00009k6eteuxptxp",
              "name": null,
              "query": "SELECT COUNT(*) FROM public.user WHERE created_at BETWEEN '<DATE-1>' AND '<DATE-2>'",
              "feedback": 1,
              "createdAt": "2023-04-29T09:49:17.899Z",
              "deletedAt": null,
              "reportKey": "Funnel Step 1",
              "updatedAt": "2023-04-29T09:47:30.367Z",
              "databaseResourceId": "clh1stpae00079k258aa0fdbq"
            },
            "value": "Funnel Step 1"
          },
          {"value": "150"},
          {"value": "119"},
          {"value": "100"},
          {"value": "98"},
          {"value": "110"},
          {"value": "134"},
          {"value": "132"},
          {"value": "89"},
          {"value": "110"},
          {"value": "90"},
          {"value": "84"},
          {"value": "146"},
          {"value": "94"},
          {"value": "101"},
          {"value": "107"}
        ],
        [
          {
            "query": {
              "id": "clh1swibw00029k6eunv2q8c2",
              "name": null,
              "query": "SELECT COUNT(*) FROM public.user WHERE profile_complete = 'true' AND created_at BETWEEN '<DATE-1>' AND '<DATE-2>'",
              "feedback": 1,
              "createdAt": "2023-04-29T09:49:17.899Z",
              "deletedAt": null,
              "reportKey": "Funnel Step 2",
              "updatedAt": "2023-04-29T09:47:35.323Z",
              "databaseResourceId": "clh1stpae00079k258aa0fdbq"
            },
            "value": "Funnel Step 2"
          },
          {"value": "86"},
          {"value": "95"},
          {"value": "76"},
          {"value": "74"},
          {"value": "86"},
          {"value": "105"},
          {"value": "98"},
          {"value": "60"},
          {"value": "84"},
          {"value": "45"},
          {"value": "67"},
          {"value": "125"},
          {"value": "74"},
          {"value": "86"},
          {"value": "90"}
        ],
        [
          {
            "query": {
              "id": "clh1swibw00049k6e1hvva0pv",
              "name": null,
              "query": "SELECT COUNT(*) FROM public.user WHERE created_at BETWEEN '<DATE-1>' AND '<DATE-2>' AND (EXISTS (SELECT * FROM idea WHERE user_id = public.user.id) OR EXISTS (SELECT * FROM thoughts WHERE user_id = public.user.id) OR EXISTS (SELECT * FROM project WHERE user_id = public.user.id))",
              "feedback": 1,
              "createdAt": "2023-04-29T09:49:17.899Z",
              "deletedAt": null,
              "reportKey": "Funnel Step 3",
              "updatedAt": "2023-04-29T09:47:39.041Z",
              "databaseResourceId": "clh1stpae00079k258aa0fdbq"
            },
            "value": "Funnel Step 3"
          },
          {"value": "43"},
          {"value": "60"},
          {"value": "48"},
          {"value": "60"},
          {"value": "56"},
          {"value": "89"},
          {"value": "86"},
          {"value": "40"},
          {"value": "63"},
          {"value": "33"},
          {"value": "60"},
          {"value": "75"},
          {"value": "60"},
          {"value": "66"},
          {"value": "68"}
        ],
        [
          {"value": "Funnel Step 1 to Step 2%"},
          {
            "unit": "%",
            "value": "57.33"
          },
          {
            "unit": "%",
            "value": "79.83"
          },
          {
            "unit": "%",
            "value": "76.00"
          },
          {
            "unit": "%",
            "value": "75.51"
          },
          {
            "unit": "%",
            "value": "78.18"
          },
          {
            "unit": "%",
            "value": "78.36"
          },
          {
            "unit": "%",
            "value": "73.81"
          },
          {
            "unit": "%",
            "value": "67.42"
          },
          {
            "unit": "%",
            "value": "76.36"
          },
          {
            "unit": "%",
            "value": "50.00"
          },
          {
            "unit": "%",
            "value": "79.76"
          },
          {
            "unit": "%",
            "value": "85.62"
          },
          {
            "unit": "%",
            "value": "78.72"
          },
          {
            "unit": "%",
            "value": "85.14"
          },
          {
            "unit": "%",
            "value": "84.12"
          }
        ],
        [
          {"value": "Funnel Step 2 to Step 3%"},
          {
            "unit": "%",
            "value": "50.00"
          },
          {
            "unit": "%",
            "value": "72.22"
          },
          {
            "unit": "%",
            "value": "63.15"
          },
          {
            "unit": "%",
            "value": "81.08"
          },
          {
            "unit": "%",
            "value": "65.12"
          },
          {
            "unit": "%",
            "value": "84.76"
          },
          {
            "unit": "%",
            "value": "87.75"
          },
          {
            "unit": "%",
            "value": "66.67"
          },
          {
            "unit": "%",
            "value": "75.00"
          },
          {
            "unit": "%",
            "value": "73.33"
          },
          {
            "unit": "%",
            "value": "89.55"
          },
          {
            "unit": "%",
            "value": "60.00"
          },
          {
            "unit": "%",
            "value": "81.08"
          },
          {
            "unit": "%",
            "value": "76.74"
          },
          {
            "unit": "%",
            "value": "75.56"
          }
        ]
      ],
      "heading": "User Activation"
    },
    null
]

export const activeUserData = 
[
    {
      "sheet": [
        [
          {"value": "Name"},
          {"value": "Tue May 31 2022"},
          {"value": "Thu Jun 30 2022"},
          {"value": "Sun Jul 31 2022"},
          {"value": "Wed Aug 31 2022"},
          {"value": "Fri Sep 30 2022"},
          {"value": "Mon Oct 31 2022"},
          {"value": "Wed Nov 30 2022"},
          {"value": "Sat Dec 31 2022"},
          {"value": "Tue Jan 31 2023"},
          {"value": "Tue Feb 28 2023"},
          {"value": "Fri Mar 31 2023"},
          {"value": "Sun Apr 30 2023"},
          {"value": "Projection - Tue May 30 2023"},
          {"value": "Projection - Thu Jun 29 2023"},
          {"value": "Projection - Sun Jul 30 2023"}
        ],
        [
          {
            "query": {
              "id": "clh1swibw00069k6e0dv70pkn",
              "name": null,
              "query": "SELECT COUNT(DISTINCT user_id) FROM (SELECT user_id AS user_id FROM idea i WHERE i.created_at BETWEEN '<DATE-1>' AND '<DATE-2>' UNION SELECT user_id FROM idea_comment ic WHERE ic.created_at BETWEEN '<DATE-1>' AND '<DATE-2>' UNION SELECT user_id FROM idea_like il WHERE il.liked_at BETWEEN '<DATE-1>' AND '<DATE-2>' UNION SELECT user_id FROM thoughts t WHERE t.created_at BETWEEN '<DATE-1>' AND '<DATE-2>' UNION SELECT user_id FROM thought_likes tl WHERE tl.liked_at BETWEEN '<DATE-1>' AND '<DATE-2>' UNION SELECT user_id FROM thought_comments tc WHERE tc.created_at BETWEEN '<DATE-1>' AND '<DATE-2>' UNION SELECT user1 FROM connections c WHERE c.formed_at BETWEEN '<DATE-1>' AND '<DATE-2>' UNION SELECT user2 FROM connections c2 WHERE c2.formed_at BETWEEN '<DATE-1>' AND '<DATE-2>' UNION SELECT user_id FROM project p WHERE p.created_at BETWEEN '<DATE-1>' AND '<DATE-2>' UNION SELECT user_id FROM project_like pl WHERE pl.liked_at BETWEEN '<DATE-1>' AND '<DATE-2>' UNION SELECT user_id FROM project_comment pc WHERE pc.created_at BETWEEN '<DATE-1>' AND '<DATE-2>') AS user_list",
              "feedback": 1,
              "createdAt": "2023-04-29T09:49:17.899Z",
              "deletedAt": null,
              "reportKey": "User Activity",
              "updatedAt": "2023-04-29T09:48:41.513Z",
              "databaseResourceId": "clh1stpae00079k258aa0fdbq"
            },
            "value": "Daily Active Users (DAUs)"
          },
          {"value": "65"},
          {"value": "76"},
          {"value": "83"},
          {"value": "80"},
          {"value": "98"},
          {"value": "102"},
          {"value": "120"},
          {"value": "118"},
          {"value": "118"},
          {"value": "127"},
          {"value": "145"},
          {"value": "140"},
          {"value": "148"},
          {"value": "155"},
          {"value": "179"}
        ],
        [
          {"value": "Growth %"},
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "16.92"
          },
          {
            "unit": "%",
            "value": "9.21"
          },
          {
            "unit": "%",
            "value": "-3.61"
          },
          {
            "unit": "%",
            "value": "22.50"
          },
          {
            "unit": "%",
            "value": "4.08"
          },
          {
            "unit": "%",
            "value": "17.65"    
          },
          {
            "unit": "%",
            "value": "-1.67"
          },
          {
            "unit": "%",
            "value": "0.00"
          },
          {
            "unit": "%",
            "value": "7.63"
          },
          {
            "unit": "%",
            "value": "14.17"
          },
          {
            "unit": "%",
            "value": "-3.45"
          }
        ],
        [
          {"value": "Weekly Active Users (WAUs)"},
          {"value": "120"},
          {"value": "146"},
          {"value": "167"},
          {"value": "190"},
          {"value": "210"},
          {"value": "198"},
          {"value": "205"},
          {"value": "223"},
          {"value": "226"},
          {"value": "220"},
          {"value": "231"},
          {"value": "240"},
          {"value": "243"},
          {"value": "255"},
          {"value": "253"}
        ],
        [
          {"value": "Growth %"},
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "21.67"
          },
          {
            "unit": "%",
            "value": "14.38"
          },
          {
            "unit": "%",
            "value": "13.77"
          },
          {
            "unit": "%",
            "value": "10.53"
          },
          {
            "unit": "%",
            "value": "-5.71"
          },
          {
            "unit": "%",
            "value": "3.54"
          },
          {
            "unit": "%",
            "value": "8.78"
          },
          {
            "unit": "%",
            "value": "1.03"
          },
          {
            "unit": "%",
            "value": "-2.65"
          },
          {
            "unit": "%",
            "value": "4.09"
          },
          {
            "unit": "%",
            "value": "3.90"
          }
        ],
        [
          {"value": "Monthly Active Users (MAUs)"},
          {"value": "203"},
          {"value": "246"},
          {"value": "266"},
          {"value": "275"},
          {"value": "302"},
          {"value": "322"},
          {"value": "329"},
          {"value": "326"},
          {"value": "335"},
          {"value": "350"},
          {"value": "343"},
          {"value": "339"},
          {"value": "350"},
          {"value": "348"},
          {"value": "340"}
        ],
        [
          {"value": "Growth %"},
          {
            "unit": "%",
            "value": "NaN"
          },
          {
            "unit": "%",
            "value": "21.18"
          },
          {
            "unit": "%",
            "value": "8.13"
          },
          {
            "unit": "%",
            "value": "3.38"
          },
          {
            "unit": "%",
            "value": "9.82"
          },
          {
            "unit": "%",
            "value": "6.62"
          },
          {
            "unit": "%",
            "value": "2.17"
          },
          {
            "unit": "%",
            "value": "-0.91"
          },
          {
            "unit": "%",
            "value": "2.76"
          },
          {
            "unit": "%",
            "value": "4.48"
          },
          {
            "unit": "%",
            "value": "-1.94"
          },
          {
            "unit": "%",
            "value": "-1.17"
          }
        ]
      ],
      "heading": "Active Users"
    },
    null
]

export const retentionData = 
[
    {
      "sheet": [
        [
          {"value": "Name"},
          {"value": "Tue May 31 2022"},
          {"value": "Thu Jun 30 2022"},
          {"value": "Sun Jul 31 2022"},
          {"value": "Wed Aug 31 2022"},
          {"value": "Fri Sep 30 2022"},
          {"value": "Mon Oct 31 2022"},
          {"value": "Wed Nov 30 2022"},
          {"value": "Sat Dec 31 2022"},
          {"value": "Tue Jan 31 2023"},
          {"value": "Tue Feb 28 2023"},
          {"value": "Fri Mar 31 2023"},
          {"value": "Sun Apr 30 2023"},
          {"value": "Projection - Tue May 30 2023"},
          {"value": "Projection - Thu Jun 29 2023"},
          {"value": "Projection - Sun Jul 30 2023"}
        ],
        [
          {"value": "Total Users"},
          {"value": "150"},
          {"value": "119"},
          {"value": "100"},
          {"value": "98"},
          {"value": "110"},
          {"value": "134"},
          {"value": "132"},
          {"value": "89"},
          {"value": "110"},
          {"value": "90"},
          {"value": "84"},
          {"value": "146"},
          {"value": "94"},
          {"value": "101"},
          {"value": "107"}
        ],
        [
          {
            "query": {
              "id": "clh3u80et0035mc0khtlnx1ih",
              "name": null,
              "query": "SELECT thought_id, user_id, created_at, idea_id, thought, user1, user2, liked_at\nFROM thoughts\nINNER JOIN thought_likes ON thoughts.id = thought_likes.thought_id\nINNER JOIN idea_like ON idea_like.user_id = thoughts.user_id\nINNER JOIN connections ON connections.user1 = thoughts.user_id \nINNER JOIN user ON user.id = thoughts.user_id\nWHERE user.email_id = 'dummytest@gmail.com' \n    AND created_at BETWEEN '<DATE-1>' AND '<DATE-2>'\n AND liked_at BETWEEN '2022-05-01' AND '2022-06-01'",
              "feedback": 0,
              "createdAt": "2023-04-30T20:01:46.517Z",
              "deletedAt": null,
              "reportKey": "Retention Activity",
              "updatedAt": "2023-05-04T22:23:30.802Z",
              "databaseResourceId": "clh1stpae00079k258aa0fdbq"
            },
            "value": "D0 Retention"
          },
          {"value": "87"},
          {"value": "65"},
          {"value": "76"},
          {"value": "65"},
          {"value": "98"},
          {"value": "100"},
          {"value": "80"},
          {"value": "68"},
          {"value": "100"},
          {"value": "78"},
          {"value": "66"},
          {"value": "68"},
          {"value": "71"},
          {"value": "74"},
          {"value": "82"},
        ],
        [
          {"value": "D1 Retention"},
          {"value": "64"},
          {"value": "50"},
          {"value": "66"},
          {"value": "46"},
          {"value": "78"},
          {"value": "88"},
          {"value": "67"},
          {"value": "58"},
          {"value": "90"},
          {"value": "76"},
          {"value": "60"},
          {"value": "58"},
          {"value": "60"},
          {"value": "63"},
          {"value": "75"},
        ],
        [
          {"value": "D7 Retention"},
          {"value": "55"},
          {"value": "43"},
          {"value": "50"},
          {"value": "35"},
          {"value": "60"},
          {"value": "72"},
          {"value": "50"},
          {"value": "42"},
          {"value": "70"},
          {"value": "55"},
          {"value": "43"},
          {"value": "40"},
          {"value": "43"},
          {"value": "42"},
          {"value": "60"},
        ],
        [
          {"value": "D14 Retention"},
          {"value": "40"},
          {"value": "20"},
          {"value": "42"},
          {"value": "30"},
          {"value": "54"},
          {"value": "60"},
          {"value": "43"},
          {"value": "31"},
          {"value": "45"},
          {"value": "40"},
          {"value": "35"},
          {"value": "30"},
          {"value": "25"},
          {"value": "35"},
          {"value": "45"},
        ],
        [
          {"value": "D30 Retention"},
          {"value": "25"},
          {"value": "18"},
          {"value": "35"},
          {"value": "24"},
          {"value": "36"},
          {"value": "40"},
          {"value": "27"},
          {"value": "26"},
          {"value": "36"},
          {"value": "29"},
          {"value": "30"},
          {"value": "24"},
          {"value": "17"},
          {"value": "24"},
          {"value": "36"},
        ]
      ],
      "heading": "User Retention"
    },
    null
]

export const marketingSpentData = 
[
    {
      "sheet": [
        [
          {"value": "Name"},
          {"value": "Tue May 31 2022"},
          {"value": "Thu Jun 30 2022"},
          {"value": "Sun Jul 31 2022"},
          {"value": "Wed Aug 31 2022"},
          {"value": "Fri Sep 30 2022"},
          {"value": "Mon Oct 31 2022"},
          {"value": "Wed Nov 30 2022"},
          {"value": "Sat Dec 31 2022"},
          {"value": "Tue Jan 31 2023"},
          {"value": "Tue Feb 28 2023"},
          {"value": "Fri Mar 31 2023"},
          {"value": "Sun Apr 30 2023"},
          {"value": "Projection - Tue May 30 2023"},
          {"value": "Projection - Thu Jun 29 2023"},
          {"value": "Projection - Sun Jul 30 2023"}
        ],
        [
          {"value": "Facebook Spend"},
          {"value": "2765.34"},
          {"value": "3621.12"},
          {"value": "3355.67"},
          {"value": "3789.45"},
          {"value": "4508.10"},
          {"value": "2898.19"},
          {"value": "3156.12"},
          {"value": "4510.23"},
          {"value": "3001.12"},
          {"value": "2989.15"},
          {"value": "2231.45"},
          {"value": "3600.23"},
        ],
        [
          {"value": "Facebook CAC"},
          {
            "unit": "₹",
            "value": "102.42",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "109.73",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "119.84",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "94.73",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "86.69",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "80.05",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "75.14",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "155.52",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "57.71",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "87.91",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "55.78",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "105.89",
            "unitPrefix": true
          }
        ],
        [
          {"value": "Google Spend"},
          {"value": "0.00"},
          {"value": "0.00"},
          {"value": "0.00"},
          {"value": "0.00"},
          {"value": "0.00"},
          {"value": "0.00"},
          {"value": "0.00"},
          {"value": "0.00"},
          {"value": "0.00"},
          {"value": "0.00"},
          {"value": "0.00"},
          {"value": "0.00"}
        ],
        [
          {"value": "Google CAC"},
          {
            "unit": "₹",
            "value": "NaN",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "NaN",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "NaN",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "NaN",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "NaN",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "NaN",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "NaN",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "NaN",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "NaN",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "NaN",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "NaN",
            "unitPrefix": true
          },
          {
            "unit": "₹",
            "value": "NaN",
            "unitPrefix": true
          }
        ]
      ],
      "heading": "Marketing Spend"
    },
    null
]

export const dummyModel = [{
    id: "dummy",
    createdAt: new Date("2023-07-01"),
    updatedAt: new Date("2023-07-01"),
    userId: "dummy-user",
    type: PREMADE_MODEL,
    name: "Churn Prediction",
    description: "This model should predict for each new user from Facebook, the likelihood that an active customer - defined as a customer who has performed workshop attended, at least once every week will stop performing the event over the next 30 days ",
    userFilter: "from Facebook",
    predictionTimeframe: 7,
    eventA: "workshop attended",
    eventB: null,
    eventAFrequency: 1,
    predictionWindow: 30,
}]

export const dummyFeatures = [
    {
        id: "dummy-feature-1",
        createdAt: new Date("2023-07-01"),
        updatedAt: new Date("2023-07-01"),
        userId: "dummy-user",
        dataModelId: "dummy",
        featureName: "device_price",
        type: "characteristic",
        importance: 0.131,
    },
    {
        id: "dummy-feature-1",
        createdAt: new Date("2023-07-01"),
        updatedAt: new Date("2023-07-01"),
        userId: "dummy-user",
        dataModelId: "characteristic",
        featureName: "location",

        importance: 0.094,
    },
    {
        id: "dummy-feature-1",
        createdAt: new Date("2023-07-01"),
        updatedAt: new Date("2023-07-01"),
        userId: "dummy-user",
        dataModelId: "event",
        featureName: "email_verified",
        importance: 0.062,
    }
]

export const dummyChurnGraph = [
    {
        userDistinctId: "user-1",
        y: 0.83,
        x: "30000"
    },
    {
        userDistinctId: "user-1",
        y: 0.85,
        x: "50000"
    },
    {
        userDistinctId: "user-1",
        y: 0.76,
        x: "40000"
    },
    {
        userDistinctId: "user-1",
        y: 0.42,
        x: "20000"
    },
    {
        userDistinctId: "user-1",
        y: 0.30,
        x: "15000"
    },
    {
        userDistinctId: "user-1",
        y: 0.13,
        x: "7000"
    },
    {
        userDistinctId: "user-1",
        y: 0.91,
        x: "90000"
    },
    {
        userDistinctId: "user-1",
        y: 0.53,
        x: "25000"
    },
    {
        userDistinctId: "user-1",
        y: 0.66,
        x: "5000"
    },
]

export const dummyUserList = "created,email,name,phone,college,current_company,current_role,linkedin_url,source,started_working_from,target_role,resume_url,pain_points,work_experience,visited_date,utm_campaign,utm_content,utm_medium,utm_term,goals,expected_preparation_duration,long_term_mentorship_help,problems_for_goals,target_companies_MAANG,target_companies_Product_Based,target_companies_Startups,target_companies_Service_Based,target_companies_Consultation_Firms,target_domain_Backend_Developer,target_domain_Fullstack_Developer,user_category_Working_Professional,user_category_Fresher,utm_source_linkedin,update_reminder_triggered,viewed,sms_drafted,first_website_visit,filter_applied,show_more_clicked,profile_visited,tab_changed,view_profile_clicked,login/signup_started,login_started,login_completed,phone_verification_started,otp_sent,otp_verification_started,page_visit,search_started,trial_doc_visited,trial_completed,feedback_form_shown,sorting_applied,otp_invalidated,filter_clicked,login/signup_cancelled,signup_completed,otp_verified,book_package_clicked,checkout_started,checkout_cancelled,payment_started,payment_completed,package_purchased,trial_booked,sms_sent,sms_delivered,button_clicked,chat_notification_received,chat_message_sent,profile_completion_started,sorting_clicked,checkout_step_active,myinterviewdoc_opened,session_notification_exit,reminder_to_attend_cycle_start,recording_started,session_completed,trial_doc_closed,group_session_registration,email_delivered,email_opened,login/signup_started1,mentee_onboarding_done,potential_mentor_assigned,session_joined_by_mentee,session_joined_by_mentor,whiteboard_opened,mentor_dashboard_visited,session_feedback_form_wrong_iframe_tally_url,checkout_button_clicked,notion_page_visited,offering_enabled,upgrade_plan_visited,plan_selected,coupon_applied,availability_updated,filter_cleared,trial_nav_next,trial_nav_back,agenda_clicked,survey_seen,email_converted,email_link_clicked,checkout_completed,city_mp,region_mp,chrome,safari,edge\n2023-07-01T16:38:23,sourabhbhandari2002@gmail.com,Sourabh Bhandari,+919650591173,,,,https://www.linkedin.com/feed/,,,Senior,https://firebasestorage.googleapis.com/v0/b/preplaced-upload-prod/o/resume%2Fcandidate-profile%2FSourabh%20Bhandari0.4743674387697867?alt=media&token=fe952532-f828-4aee-b687-ea9477893f26,,,,page_home,srikanth,organic,success_story,['Switch to a better job'],2 to 3 months,Correct path,Teach skills,Accountability,Motivation & Support system,Solve doubts,Resume & Referrals,Lack of continuity in my job search efforts and also getting the calls for interviews.,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,1,1,0,0,0,0,1,0,1,1,0,1,0,0,1,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,Delhi,National Capital Territory of Delhi,1,0,0\n2023-07-12T11:29:28,abinjohn001@gmail.com,Abin John,+919605328329,,,,,,,Junior,,,,,,,,,['Switch to a better job'],I do not have a fixed timeline,Correct path,Teach skills,Solve doubts,I haven't got any chance to work on a project. I am looking to get direction to learn the skills required for real projects.,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0\n2023-07-08T16:55:13,guttidata@gmail.com,vishu gutti,+919880038284,,,,https://www.linkedin.com/in/vishudata/,,,Senior,https://firebasestorage.googleapis.com/v0/b/preplaced-upload-prod/o/resume%2Fcandidate-profile%2Fvishu%20gutti0.9866398617969725?alt=media&token=a067c0b7-bb11-4e7a-b565-cbdb67ec08e4,,,,page_home,deepak_post,inf,yearsof_experience_as_data_analyst,['Switch to a new domain'],2 to 3 months,Correct path,Teach skills,Accountability,Motivation & Support system,Solve doubts,Resume & Referrals,i need to have a clear path. i feel mentor is needed here. i need help on how to prepare for interviews.,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,0,0,1,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,1,1,0,0,1,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,Bengaluru,Karnataka,1,0,0\n2023-07-05T10:07:47,nadeem.khan@preplaced.in,Nadeem Khan Mentee,+918827254360,asdasd,Preplaced,['asdasd'],https://www.linkedin.com/in/nadeemkhanrtm/,['Google'],2020,Junior,https://firebasestorage.googleapis.com/v0/b/preplaced-upload-dev/o/resume%2Fcandidate-profile%2FNadeem%20Khan%20Mentor0.7952235806929364?alt=media&token=707f0656-d938-4ed5-bf04-5085fd2bac4f,asd,0,Fri, 11 Nov 2022 12:55:34 GMT,product_home_page,aman_chowdhary,influencer,freshers_layoffs,['Switch to a better job'],I do not have a fixed timeline,Correct path,Testing TesingTesting TesingTesting TesingTesting TesingTesting TesingTesting TesingTesting TesingTesting TesingTesting Tesing,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,Bhopal,Madhya Pradesh,1,0,0\n"

export const dummyCohortsData = [
    {
        name: "Campaign - Insta Influencer July 2023",
        predictedChurn: 0.75,
        actualChurn: 0.8,
        deviation: 0.05,
        userList: dummyUserList
    },
    {
        name: "Campaign - Organic Referral",
        predictedChurn: 0.66,
        actualChurn: 0.65,
        deviation: 0.01,
        userList: dummyUserList
    },
    {
        name: "Phone - Apple Devices",
        predictedChurn: 0.15,
        actualChurn: 0.14,
        deviation: 0.01,
        userList: dummyUserList
    },
    {
        name: "Location - Tier 2 Cities",
        predictedChurn: 0.66,
        actualChurn: 0.65,
        deviation: 0.01,
        userList: dummyUserList
    },
]

export const dummyChurnByDate = [
    {
        date: "2023-07-01",
        users: 80,
        predictedChurn: 0.75,
        actualChurn: 0.8
    },
    {
        date: "2023-07-02",
        users: 100,
        predictedChurn: 0.7,
        actualChurn: 0.83
    },
    {
        date: "2023-07-03",
        users: 80,
        predictedChurn: 0.8,
        actualChurn: 0.6
    },
    {
        date: "2023-07-04",
        users: 80,
        predictedChurn: 0.77,
        actualChurn: 0.65
    },
    {
        date: "2023-07-05",
        users: 80,
        predictedChurn: 0.84,
        actualChurn: 0.79
    },
    {
        date: "2023-07-06",
        users: 80,
        predictedChurn: 0.63,
        actualChurn: 0.71
    },
    {
        date: "2023-07-07",
        users: 80,
        predictedChurn: 0.71,
        actualChurn: 0.66
    }
]