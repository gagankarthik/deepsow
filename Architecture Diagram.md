flowchart TD
    User[User] --> FE[Next.js Frontend]
    
    FE --> API[FastAPI Backend]
    API --> AI[OpenAI API]
    API --> DB[(DynamoDB)]
    API --> S3[AWS S3 Files]
    
    API --> CRM[Salesforce<br/>Integration]
    API --> VMS[SAP Fieldglass<br/>Integration]
    API --> ERP[ERP Systems<br/>QuickBooks/Xero]
    API --> PM[Project Tools<br/>Jira/Asana]
    
    CRM --> API
    VMS --> API
    ERP --> API
    PM --> API
    
    FE --> Auth[Auth Service<br/>NextAuth/Cognito]
    Auth --> API