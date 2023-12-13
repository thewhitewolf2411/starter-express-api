const { isDev } = require("@config")

class ErrorTranslation {
  enUS

  svSE

  constructor({ enUS, svSE }) {
    this.enUS = enUS
    this.svSE = svSE
  }
}

class ErrorMessages {
  static FORBIDDEN = new ErrorTranslation({ enUS: "Permission denied" })

  static NOT_FOUND = new ErrorTranslation({ enUS: "Not Found" })

  static BAD_REQUEST = new ErrorTranslation({ enUS: "Bad Request" })

  static UNPROCESSABLE_CONTENT = new ErrorTranslation({ enUS: "Unprocessable Content" })

  static SERVER = new ErrorTranslation({ enUS: "Internal Server Error" })

  static SERVICE_UNAVAILABLE = new ErrorTranslation({ enUS: "Service unavailable" })

  static CAREGIVER_NOT_FOUND = new ErrorTranslation({ enUS: "Caregiver not found" })

  static PATIENT_NOT_FOUND = new ErrorTranslation({ enUS: "Patient not found" })

  static USER_NOT_FOUND = new ErrorTranslation({ enUS: "User not found" })

  static SESSION_NOT_FOUND = new ErrorTranslation({ enUS: "Session not found" })

  static BOOKING_FAILED = new ErrorTranslation({
    enUS: "Unfortunately, the booking could not be completed. Please try again shortly.",
    svSE: "Bokningen kunde tyvärr inte genomföras. Vänligen försök igen inom kort.",
  })

  static AVAILABILITY_NOT_FOUND = new ErrorTranslation({
    enUS: "Can't find this availability in DB",
    svSE: "Tillgängligheten kan inte hittas. Vänligen kontakta info@dinpsykolog.se.",
  })

  static INVALID_TOKEN = new ErrorTranslation({ enUS: "Token not valid or expired" })

  static NOT_REGISTERED_IN_SWEDEN = new ErrorTranslation({
    enUS: "To be able to use the service, you must be registered in Sweden.",
    svSE: "För att kunna använda tjänsten måste du vara folkbokförd i Sverige.",
  })

  static AGE_RESTRICTION = new ErrorTranslation({
    enUS: "You need to be over 18 to get help from us.",
    svSE: "Du behöver vara över 18 år för att få hjälp av oss.",
  })

  static UNKNOWN_FREE_TEXT_TYPE = new ErrorTranslation({ enUS: "Unknown free text types", svSE: "Okända fritexttyper" })

  static NO_MATCHING_QUESTION_TYPE = new ErrorTranslation({ enUS: "No matching questionAnswerType" })

  static MEETING_NOT_FOUND = new ErrorTranslation({ enUS: "Meeting not found" })

  static INVALID_MEETING = new ErrorTranslation({ enUS: "Invalid meeting for this operation" })

  static PAYMENT_INTENT_NOT_FOUND = new ErrorTranslation({ enUS: "Payment intent not found" })

  static NEW_CHAT_SESSION_CREATION = new ErrorTranslation({
    enUS: "Forbidden to have active chat/video sessions to create new chat session",
  })

  static INVALID_FREE_CARD_FOR_MEETING = new ErrorTranslation({
    enUS: "The free card is not valid for the selected video meeting",
    svSE: "Frikortet är inte giltigt för det valda videomötet",
  })

  static NO_FILE = new ErrorTranslation({ enUS: "Please upload a file" })

  static ALREADY_HAS_A_SESSION = new ErrorTranslation({
    enUS: "This user already has a video session",
    svSE: "Patienten har redan en bokning"
  })

  static AVAILABILITY_SHOULD_START_IN_THE_FUTURE = new ErrorTranslation({
    enUS: "Availability should start in the future",
    svSE: "Starttiden måste vara i framtiden",
  })

  static ALREADY_CANCELED = new ErrorTranslation({ enUS: "Meeting has already been canceled" })

  static WORKDAY_AVAILABILITY_START = new ErrorTranslation({
    enUS: "Workday recurrence availability should start on Monday-Friday",
    svSE: "Den återkommande vardagstillgängligheten måste starta på en vardag",
  })

  static AVAILABILITIES_OVERLAP = new ErrorTranslation({
    enUS: "It is overlapping your existing availability starting at {{startDate}}-{{endTime}}",
    svSE: "Den överlappar din nuvarande tillgänglighet med start {{startDate}}-{{endTime}}",
  })

  static SLOT_BOOKED = new ErrorTranslation({
    enUS: "Someone else has already booked this time.",
    svSE: "Tiden är tyvärr redan bokad. Välj en ny tid.",
  })

  static NOT_ELIGIBLE_FOR_HALSA_HEMMA = new ErrorTranslation({ enUS: "Patient is not eligible to register" })

  static CAREGIVER_IS_NOT_CONNECTED_TO_PATIENT = new ErrorTranslation({
    enUS: "Caregiver is not connected with this patient",
  })

  static NO_BANK_ID_FOUND = new ErrorTranslation({
    enUS: "We cannot find the BankID. Please try again.",
    svSE: "Vi hittar inte BankID. Var god försök igen."
  })

  static getTokenizedMessage(message, tokens = {}, lang = "enUS") {
    let messageText = isDev ? message.enUS : message[lang] || message.enUS
    Object.keys(tokens).forEach((key) => {
      messageText = messageText.replaceAll(`{{${key}}}`, tokens[key])
    })
    return messageText
  }
}

module.exports = { ErrorMessages, ErrorTranslation }
