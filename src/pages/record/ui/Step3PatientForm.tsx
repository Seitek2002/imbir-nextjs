import Link from "next/link";

import { cn } from "@/shared/lib/utils";
import { Button, Input, PhoneInput, Textarea } from "@/shared/ui";
import { Spinner } from "@/shared/ui";

import type { RecordForm } from "../model/use-record-form";
import { FieldLabel } from "./FieldLabel";
import { StepTitle } from "./StepTitle";

export const Step3PatientForm = ({ form }: { form: RecordForm }) => {
  const {
    mobileStep,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phone,
    setPhone,
    setPhoneDialCode,
    phoneCountryCode,
    phoneFieldKey,
    email,
    setEmail,
    comment,
    setComment,
    errors,
    setErrors,
    isSubmitting,
    validateAndSubmit,
    isAuthenticated,
    isSessionExpired,
    submitAsGuest,
    loginLink,
  } = form;

  return (
    <section
      id="record-step-3"
      className={cn(
        "p-4 lg:p-6 lg:border-t lg:border-border-soft",
        mobileStep !== 3 && "hidden",
        "lg:block",
      )}
    >
      <StepTitle number={3} title="Заполните данные" />

      {/* Поля подставлены из профиля, и раньше их правки у вошедшего молча
          терялись. Теперь изменённое уходит врачу как контакт на визит. */}
      {isAuthenticated && (
        <p className="text-xs text-muted mb-3">
          Данные подставлены из профиля. Записываете другого человека или хотите
          оставить другой номер — измените их: врач увидит эти данные в записи,
          профиль не изменится.
        </p>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <Input
          label="Имя"
          placeholder="Введите ваше имя"
          value={firstName}
          onChange={(event) => {
            setFirstName(event.target.value);
            setErrors((prev) => ({ ...prev, firstName: undefined }));
          }}
          error={errors.firstName}
        />

        <Input
          label="Фамилия"
          placeholder="Введите вашу фамилию"
          value={lastName}
          onChange={(event) => {
            setLastName(event.target.value);
            setErrors((prev) => ({ ...prev, lastName: undefined }));
          }}
          error={errors.lastName}
        />

        {/* Код страны выбирается, как на входе и регистрации: раньше здесь
            был зашит «+996», и номер гостя из Казахстана или России
            обрезался до 9 цифр. key пересоздаёт поле, когда номер с другим
            кодом подставился из профиля. */}
        <PhoneInput
          key={phoneFieldKey}
          allCountries
          label="Номер телефона"
          defaultCountryCode={phoneCountryCode}
          value={phone}
          onChange={(value) => {
            setPhone(value);
            setErrors((prev) => ({ ...prev, phone: undefined }));
          }}
          onCountryChange={(country) => {
            setPhoneDialCode(country.dialCode);
            setErrors((prev) => ({ ...prev, phone: undefined }));
          }}
          error={errors.phone}
        />

        <div>
          <FieldLabel label="Электронная почта" hint="Необязательное поле" />
          <Input
            placeholder="Введите вашу почту"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
          />
        </div>

        <div className="lg:col-span-2 max-w-full lg:max-w-75">
          <FieldLabel label="Комментарий" hint="Необязательное поле" />
          <Textarea
            rows={4}
            placeholder="Введите ваш комментарий"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </div>
      </div>

      {errors.submit && (
        <p className="mt-4 text-sm text-red-500">{errors.submit}</p>
      )}

      {/* Сессия истекла, пока форма была открыта. Раньше повторный клик молча
          оформлял гостевую офлайн-запись, которой потом не было в «Моих
          записях». Гостем — только по явному выбору. */}
      {isSessionExpired && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm"
        >
          <p className="font-medium text-red-600">
            Сессия истекла — войдите снова
          </p>
          <p className="mt-1 text-foreground">
            Без входа запись оформится как гостевая и офлайн: её не будет в
            «Моих записях», без видеозвонка и отзыва.
          </p>
          <div className="mt-3 flex flex-col gap-2 lg:flex-row">
            <Link
              href={loginLink}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 h-10 text-sm text-white font-medium active:bg-primary-dark"
            >
              Войти снова
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="justify-center"
              disabled={isSubmitting}
              onClick={() => submitAsGuest()}
            >
              Записаться без входа
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button
          className="w-full lg:w-auto lg:min-w-50 justify-center"
          size="lg"
          disabled={isSubmitting || isSessionExpired}
          onClick={() => validateAndSubmit()}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Spinner className="size-4" />
              Отправка...
            </span>
          ) : (
            "Продолжить"
          )}
        </Button>
      </div>
    </section>
  );
};
