aws dynamodb batch-write-item \
  --request-items '{
    "products": [
      {
        "PutRequest": {
          "Item": {
            "id": {"S": "7567ec4b-b10c-48c5-9345-fc73c48a80aa"},
            "title": {"S": "Refactoring by M. Fowler"},
            "description": {"S": "Improving the Design of Existing Code shed light on the refactoring process, describing the principles and best practices for its implementation."},
            "price": {"N": "2.4"}  
          }
        }
      },
      { 
        "PutRequest": {
          "Item": {
            "id": {"S": "7567ec4b-b10c-48c5-9345-fc73c48a80a0"},
            "title": {"S": "Pragmatic programmer. The path from apprentice to master. Andrew Hunt, David Thomas"},
            "description": {"S": "\"Pragmatic programmer. The path from apprentice to master\" will tell you everything a person needs to know, starting his way in the field of IT projects. Almost a cult book. You will learn how to deal with software shortcomings, how to create a dynamic, effective and adaptable program, how to form a successful team of programmers."},
            "price": {"N": "10"}
          }
        }
      }, 
      {
        "PutRequest": {
          "Item": {
            "id": {"S": "7567ec4b-b10c-48c5-9345-fc73c48a80a3"},
            "title": {"S": "Perfect code. Master Class. Steve McConnell"},
            "description": {"S": "\"Perfect code. Master-class\" - an updated edition of the time-tested bestseller. A book that makes you think and helps you create the perfect code. And it does not matter if you are a beginner or a pro, in this publication you will definitely find information for growth and work on your project."},
            "price": {"N": "23"}
          }
        }
      },
      {
        "PutRequest": {
          "Item": {
            "id": {"S": "7567ec4b-b10c-48c5-9345-fc73c48a80a1"},
            "title": {"S": "At the peak. How to maintain maximum efficiency without burnout. Brad Stahlberg, Steve Magness"},
            "description": {"S": "The book \"At the peak. How to maintain maximum efficiency without burnout\" is especially necessary for programmers who are accustomed to plunge headlong into work, not keeping track of time and waste of resources such as strength and health."},
            "price": {"N": "15"}
          }
        }
      },
      {
        "PutRequest": {
          "Item": {
            "id": {"S": "7567ec4b-b10c-48c5-9345-fc73c48a80a2"},
            "title": {"S": "Programming without fools. Katrin Passig, Johannes Jander"},
            "description": {"S": "This book is interesting to read for both a beginner and an experienced programmer. The authors clearly and humorously talk about the fact that programming is in many ways communication. Programming style, naming, commenting, working with someone else'\''s code - often agreements develop exactly where there is strict regulation at the programming language level."},
            "price": {"N": "23"}
          }
        }
      }
    ],
    "stocks": [  
    {
      "PutRequest": {
        "Item": {
          "product_id": {"S": "7567ec4b-b10c-48c5-9345-fc73c48a80aa"},
          "count": {"N": "10"}  
        }
      }
    }, 
    {
      "PutRequest": {
        "Item": {
          "product_id": {"S": "7567ec4b-b10c-48c5-9345-fc73c48a80a3"},
          "count": {"N": "18"}
        }
      }
    },
    {
      "PutRequest": {
        "Item": {
          "product_id": {"S": "7567ec4b-b10c-48c5-9345-fc73c48a80a1"},
          "count": {"N": "3"}
        }
      }
    },
    {
      "PutRequest": {
        "Item": {
          "product_id": {"S": "7567ec4b-b10c-48c5-9345-fc73c48a80a2"},
          "count": {"N": "20"}
        }
      }
    }
  ]}'