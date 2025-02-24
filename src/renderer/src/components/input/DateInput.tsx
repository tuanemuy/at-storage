import { parseDate } from "@ark-ui/react/date-picker";

import { DatePicker } from "../ui/date-picker";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import { IconButton } from "../ui/icon-button";
import { Input } from "../ui/input";

type Props = {
  value: string;
  onChange: (value?: string) => void;
};

export function DateInput({ value, onChange }: Props) {
  return (
    <DatePicker.Root
      value={parseDate([value])}
      onValueChange={(details) => {
        const value = details.value[0];
        if (value) {
          const year = value.year;
          const month = value.month.toString().padStart(2, "0");
          const day = value.day.toString().padStart(2, "0");
          onChange(`${year}-${month}-${day}`);
        }
      }}
      positioning={{ sameWidth: true }}
      startOfWeek={0}
      locale={window.navigator.language}
    >
      <DatePicker.Control>
        <DatePicker.Input asChild>
          <Input />
        </DatePicker.Input>
        <DatePicker.Trigger asChild>
          <IconButton variant="outline" aria-label="Open date picker">
            <CalendarIcon />
          </IconButton>
        </DatePicker.Trigger>
      </DatePicker.Control>
      <DatePicker.Positioner>
        <DatePicker.Content>
          <DatePicker.View view="day">
            <DatePicker.Context>
              {(api) => (
                <>
                  <DatePicker.ViewControl>
                    <DatePicker.PrevTrigger asChild>
                      <IconButton variant="ghost" size="sm">
                        <ChevronLeftIcon />
                      </IconButton>
                    </DatePicker.PrevTrigger>
                    <DatePicker.ViewTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <DatePicker.RangeText />
                      </Button>
                    </DatePicker.ViewTrigger>
                    <DatePicker.NextTrigger asChild>
                      <IconButton variant="ghost" size="sm">
                        <ChevronRightIcon />
                      </IconButton>
                    </DatePicker.NextTrigger>
                  </DatePicker.ViewControl>
                  <DatePicker.Table>
                    <DatePicker.TableHead>
                      <DatePicker.TableRow>
                        {api.weekDays.map((weekDay, id) => (
                          // biome-ignore lint:
                          <DatePicker.TableHeader key={id}>
                            {weekDay.narrow}
                          </DatePicker.TableHeader>
                        ))}
                      </DatePicker.TableRow>
                    </DatePicker.TableHead>
                    <DatePicker.TableBody>
                      {api.weeks.map((week, id) => (
                        // biome-ignore lint:
                        <DatePicker.TableRow key={id}>
                          {week.map((day, id) => (
                            // biome-ignore lint:
                            <DatePicker.TableCell key={id} value={day}>
                              <DatePicker.TableCellTrigger asChild>
                                <IconButton variant="ghost">
                                  {day.day}
                                </IconButton>
                              </DatePicker.TableCellTrigger>
                            </DatePicker.TableCell>
                          ))}
                        </DatePicker.TableRow>
                      ))}
                    </DatePicker.TableBody>
                  </DatePicker.Table>
                </>
              )}
            </DatePicker.Context>
          </DatePicker.View>
          <DatePicker.View view="month">
            <DatePicker.Context>
              {(api) => (
                <>
                  <DatePicker.ViewControl>
                    <DatePicker.PrevTrigger asChild>
                      <IconButton variant="ghost" size="sm">
                        <ChevronLeftIcon />
                      </IconButton>
                    </DatePicker.PrevTrigger>
                    <DatePicker.ViewTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <DatePicker.RangeText />
                      </Button>
                    </DatePicker.ViewTrigger>
                    <DatePicker.NextTrigger asChild>
                      <IconButton variant="ghost" size="sm">
                        <ChevronRightIcon />
                      </IconButton>
                    </DatePicker.NextTrigger>
                  </DatePicker.ViewControl>
                  <DatePicker.Table>
                    <DatePicker.TableBody>
                      {api
                        .getMonthsGrid({ columns: 4, format: "short" })
                        .map((months, id) => (
                          // biome-ignore lint:
                          <DatePicker.TableRow key={id}>
                            {months.map((month, id) => (
                              <DatePicker.TableCell
                                // biome-ignore lint:
                                key={id}
                                value={month.value}
                              >
                                <DatePicker.TableCellTrigger asChild>
                                  <Button variant="ghost">{month.label}</Button>
                                </DatePicker.TableCellTrigger>
                              </DatePicker.TableCell>
                            ))}
                          </DatePicker.TableRow>
                        ))}
                    </DatePicker.TableBody>
                  </DatePicker.Table>
                </>
              )}
            </DatePicker.Context>
          </DatePicker.View>
          <DatePicker.View view="year">
            <DatePicker.Context>
              {(api) => (
                <>
                  <DatePicker.ViewControl>
                    <DatePicker.PrevTrigger asChild>
                      <IconButton variant="ghost" size="sm">
                        <ChevronLeftIcon />
                      </IconButton>
                    </DatePicker.PrevTrigger>
                    <DatePicker.ViewTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <DatePicker.RangeText />
                      </Button>
                    </DatePicker.ViewTrigger>
                    <DatePicker.NextTrigger asChild>
                      <IconButton variant="ghost" size="sm">
                        <ChevronRightIcon />
                      </IconButton>
                    </DatePicker.NextTrigger>
                  </DatePicker.ViewControl>
                  <DatePicker.Table>
                    <DatePicker.TableBody>
                      {api.getYearsGrid({ columns: 4 }).map((years, id) => (
                        // biome-ignore lint:
                        <DatePicker.TableRow key={id}>
                          {years.map((year, id) => (
                            // biome-ignore lint:
                            <DatePicker.TableCell key={id} value={year.value}>
                              <DatePicker.TableCellTrigger asChild>
                                <Button variant="ghost">{year.label}</Button>
                              </DatePicker.TableCellTrigger>
                            </DatePicker.TableCell>
                          ))}
                        </DatePicker.TableRow>
                      ))}
                    </DatePicker.TableBody>
                  </DatePicker.Table>
                </>
              )}
            </DatePicker.Context>
          </DatePicker.View>
        </DatePicker.Content>
      </DatePicker.Positioner>
    </DatePicker.Root>
  );
}
