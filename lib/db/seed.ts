async function seed() {
  // await db.insert(teamMembers).values({
  //   teamId: team.id,
  //   userId: user.id,
  //   role: 'owner'
  // });
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
