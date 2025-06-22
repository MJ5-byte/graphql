export const GRAPHQL_ENDPOINT = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('jwt')}`
});
