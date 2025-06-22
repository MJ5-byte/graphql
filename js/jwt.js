export function getUserIdFromToken() {
  const token = localStorage.getItem('jwt');
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));

    const payload = JSON.parse(jsonPayload);
    const claims = payload['https://hasura.io/jwt/claims'];

    return claims?.['x-hasura-user-id'] ? parseInt(claims['x-hasura-user-id']) : null;
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}
