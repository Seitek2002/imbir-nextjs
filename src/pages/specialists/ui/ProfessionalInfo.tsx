import { FC } from "react";

import { Dropdown } from "@/shared/ui";

import { inp, lbl } from "../model/constants";
import { IProps } from "../model/types";

export const ProfessionalInfo: FC<IProps> = ({ isEditing, d, set }) => {
  return (
    <div className="p-8">
      <h3 className="text-foreground font-semibold text-lg mb-6">
        Профессиональные данные
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5">
        <div>
          {isEditing ? (
            <>
              <label className={lbl}>Специализация</label>
              <input
                type="text"
                value={d.specialty}
                onChange={(e) => set("specialty", e.target.value)}
                placeholder="Введите специализацию"
                className={inp}
              />
            </>
          ) : (
            <>
              <div className="text-muted text-sm mb-1">Специализация</div>
              <div className="text-foreground text-base">
                {d.specialty || "—"}
              </div>
            </>
          )}
        </div>
        <div>
          {isEditing ? (
            <>
              <label className={lbl}>Дополнительная специализация</label>
              <input
                type="text"
                value={d.additionalSpecialty}
                onChange={(e) => set("additionalSpecialty", e.target.value)}
                placeholder="Введите специализацию"
                className={inp}
              />
            </>
          ) : (
            <>
              <div className="text-muted text-sm mb-1">
                Дополнительная специализация
              </div>
              <div className="text-foreground text-base">
                {d.additionalSpecialty || "—"}
              </div>
            </>
          )}
        </div>
        <div>
          {isEditing ? (
            <>
              <label className={lbl}>Стаж работы (лет)</label>
              <input
                type="number"
                min="0"
                value={d.experienceYears}
                onChange={(e) => set("experienceYears", e.target.value)}
                placeholder="0"
                className={inp}
              />
            </>
          ) : (
            <>
              <div className="text-muted text-sm mb-1">Стаж работы (лет)</div>
              <div className="text-foreground text-base">
                {d.experienceYears || "—"}
              </div>
            </>
          )}
        </div>
        <div>
          {isEditing ? (
            <>
              <label className={lbl}>Текущая должность</label>
              <input
                type="text"
                value={d.currentPosition}
                onChange={(e) => set("currentPosition", e.target.value)}
                placeholder="Введите должность"
                className={inp}
              />
            </>
          ) : (
            <>
              <div className="text-muted text-sm mb-1">Текущая должность</div>
              <div className="text-foreground text-base">
                {d.currentPosition || "—"}
              </div>
            </>
          )}
        </div>
        <div>
          {isEditing ? (
            <>
              <label className={lbl}>Место работы (клиника)</label>
              <input
                type="text"
                value={d.workplace}
                onChange={(e) => set("workplace", e.target.value)}
                placeholder="Название клиники"
                className={inp}
              />
            </>
          ) : (
            <>
              <div className="text-muted text-sm mb-1">
                Место работы (клиника)
              </div>
              <div className="text-foreground text-base">
                {d.workplace || "—"}
              </div>
            </>
          )}
        </div>
        <div>
          {isEditing ? (
            <Dropdown
              label="Категория / Квалификация"
              placeholder="Выберите"
              options={[
                { label: "Высшая", value: "Высшая" },
                { label: "Первая", value: "Первая" },
                { label: "Вторая", value: "Вторая" },
                { label: "Без категории", value: "Без категории" },
              ]}
              value={d.qualification}
              onChange={(val) => set("qualification", val)}
            />
          ) : (
            <>
              <div className="text-muted text-sm mb-1">
                Категория / Квалификация
              </div>
              <div className="text-foreground text-base">
                {d.qualification || "—"}
              </div>
            </>
          )}
        </div>
        <div className="col-span-2">
          {isEditing ? (
            <>
              <label className={lbl}>Научная степень</label>
              <input
                type="text"
                value={d.scientificDegree}
                onChange={(e) => set("scientificDegree", e.target.value)}
                placeholder="Введите степень"
                className={inp}
              />
            </>
          ) : (
            <>
              <div className="text-muted text-sm mb-1">Научная степень</div>
              <div className="text-foreground text-base">
                {d.scientificDegree || "—"}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
