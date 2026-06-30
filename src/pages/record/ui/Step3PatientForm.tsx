import { cn } from "@/shared/lib/utils";
import { Button, Input, Textarea } from "@/shared/ui";

import { isPhoneValid, normalizeLocalPhone } from "../model/lib";
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
    email,
    setEmail,
    comment,
    setComment,
    errors,
    setErrors,
    isSubmitting,
    validateAndSubmit,
  } = form;

  return (
    <section
      className={cn(
        "p-4 lg:p-6 lg:border-t lg:border-border-soft",
        mobileStep !== 3 && "hidden",
        "lg:block",
      )}
    >
      <StepTitle number={3} title="Заполните данные" />

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
          label="Введите фамилию"
          placeholder="Введите вашу фамилию"
          value={lastName}
          onChange={(event) => {
            setLastName(event.target.value);
            setErrors((prev) => ({ ...prev, lastName: undefined }));
          }}
          error={errors.lastName}
        />

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-overlay">
            Номер телефона
          </span>
          <div
            className={cn(
              "flex items-center h-11 rounded-lg border transition-all overflow-hidden",
              errors.phone
                ? "border-red-400"
                : "border-border-soft focus-within:border-primary/60",
            )}
          >
            <span className="px-3 h-full flex items-center bg-[#F7F8F9] border-r border-border-soft text-sm text-foreground select-none shrink-0">
              +996
            </span>
            <input
              type="tel"
              placeholder="000 000 000"
              value={phone}
              onChange={(event) => {
                setPhone(normalizeLocalPhone(event.target.value));
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              onBlur={() => {
                if (!phone) return;
                setErrors((prev) => ({
                  ...prev,
                  phone: isPhoneValid(phone)
                    ? undefined
                    : "Проверьте формат номера",
                }));
              }}
              className="flex-1 h-full px-3 text-sm text-foreground outline-none bg-transparent placeholder:text-muted"
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone}</p>
          )}
        </div>

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

      <div className="mt-6">
        <Button
          className="w-full lg:w-auto lg:min-w-50 justify-center"
          size="lg"
          disabled={isSubmitting}
          onClick={validateAndSubmit}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin size-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
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
