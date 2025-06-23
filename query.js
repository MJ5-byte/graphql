// GraphQL queries
export const USER_QUERY = `
  query User {
    user {
      auditRatio
      email
      firstName
      lastName
      login
      totalDown
      totalUp
      groupsByCaptainid {
        captainId
        captainLogin
        createdAt
        eventId
        id
      }
    }
    event_user(where: { eventId: { _in: [72, 20, 250] } }) {
      level
      userId
      userLogin
      eventId
    }
    toad_session_game_results {
      level
      result {
        name
      }
      attempts
    }
  }
`;

export const XP_HISTORY_QUERY = `
  query {
    transaction(where: {type: {_eq: "xp"}}, order_by: {createdAt: asc}) {
      amount
      createdAt
    }
  }
`;