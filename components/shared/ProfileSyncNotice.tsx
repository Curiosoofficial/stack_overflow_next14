// Wird angezeigt, wenn jemand bei Clerk eingeloggt ist, das Profil aber nicht
// aus MongoDB geladen oder dort angelegt werden konnte. Vorher stürzte die
// Seite in diesem Fall ab.
const ProfileSyncNotice = () => {
  return (
    <div className="background-light800_dark300 text-dark300_light700 rounded-lg p-6">
      <p className="paragraph-semibold">Your profile could not be loaded.</p>
      <p className="body-regular mt-2">Please reload the page in a few seconds.</p>
    </div>
  );
};

export default ProfileSyncNotice;
