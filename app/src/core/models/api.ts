export interface ApiDefinition {
    name: string;
    baseUrl: string;
    authenticationMethod?: string; // this would be an enum once a method is supported
    endpoints: {[key: string]: EndpointDetails };
}

interface EndpointDetails {
    url: string;
    method: "GET";
}
