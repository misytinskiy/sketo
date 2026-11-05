/** Approved initial destination for website orders. Almaty is a later phase.
 * Keep this server-owned: a buyer's delivery city does not choose a Poster spot.
 * Order forwarding must consume this configuration when it is implemented.
 */
export const posterOrderDestination = {
  account: "sketo",
  spotId: "1",
  name: "Sketo Astana",
} as const;
