import i18n from '@/lang';

export function getErrorMessage(error): Nullable<string> {
  if (!error) {
    return null;
  }

  let errMessage = i18n.t(`historyErrorMessages.generalError`);

  if (typeof error === 'string') {
    return errMessage.toString(); // Backward compatibility
  }

  if (error.name && error.section) {
    errMessage = i18n.t(`historyErrorMessages.${error.section.toLowerCase()}.${error.name.toLowerCase()}`);
    if (errMessage.toString().startsWith('historyErrorMessages')) {
      // was not found in json files
      return i18n.t(`historyErrorMessages.generalError`).toString();
    }
  }

  return errMessage.toString();
}
