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
        campus
        captainId
        captainLogin
        createdAt
        eventId
        id
        objectId
        path
        status
        updatedAt
      }
      TransactionsFiltered1: transactions(where: {type: {_eq: "xp"}, path: { _like: "%bh-module%", _nregex: "^.(piscine-js/|piscine-rust/|piscine-ui/|piscine-ux/)." }}) {
        amount
        type
        path
        createdAt
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
  query XPHistory($userId: ID!) {
    user(id: $userId) {
      id
      transactions(where: {type: {_eq: "xp"}}) {
        amount
        createdAt
      }
    }
  }
`;
