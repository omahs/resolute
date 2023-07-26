import React from "react";

import InputAdornment from "@mui/material/InputAdornment";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import PropTypes from "prop-types";
import TextField from "@mui/material/TextField";
import { Controller, useFormContext } from "react-hook-form";
import { FormControl } from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useDispatch, useSelector } from "react-redux";
import { getICNSName } from "../features/common/commonSlice";

export function PeriodicFeegrant(props) {
  const { loading, onGrant, currency, granters, granter, setGranter } = props;

  const { handleSubmit, control, getValues } = useFormContext();

  const dispatch = useDispatch();
  const isAuthzMode = useSelector((state) => state.common.authzMode);
  const icnsNames = useSelector((state) => state.common.icnsNames);

  const fetchName = (address) => {
    if (!icnsNames?.[address]) {
      dispatch(
        getICNSName({
          address: address,
        })
      );
    }
    return icnsNames?.[address]?.name;
  };

  return (
    <>
      {isAuthzMode && granters?.length > 0 ? (
        <FormControl
          fullWidth
          sx={{
            mt: 1,
            mb: 2,
          }}
        >
          <InputLabel id="granter-label">From *</InputLabel>
          <Select
            labelId="granter-label"
            id="granter-select"
            value={granter}
            label="From *"
            onChange={(e) => {
              setGranter(e.target.value);
            }}
            size="small"
            sx={{
              p: 1,
            }}
          >
            {granters.map((granter, index) => (
              <MenuItem id={index} value={granter}>
              {fetchName(granter) || granter}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}
      <Controller
        name="grantee"
        control={control}
        rules={{ required: "Grantee is required" }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            label="Grantee"
            value={value}
            required
            onChange={onChange}
            error={!!error}
            helperText={error ? error.message : null}
            fullWidth
          />
        )}
      />
      <br />
      <br />
      <div>
        <Controller
          name="spendLimit"
          control={control}
          rules={{
            validate: (value) => {
              return Number(value) >= 0;
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextField
              label="Spend Limit"
              value={value}
              onChange={onChange}
              inputMode="decimal"
              error={!!error}
              helperText={
                error
                  ? error.message.length === 0
                    ? "Invalid spend limit"
                    : error.message
                  : null
              }
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    {currency?.coinDenom}
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </div>
      <Controller
        name="expiration"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              disablePast
              renderInput={(props) => (
                <TextField style={{ marginTop: 32 }} fullWidth {...props} />
              )}
              label="Expiration"
              value={value}
              error={!!error}
              onChange={onChange}
              helperText={error ? error.message : null}
            />
          </LocalizationProvider>
        )}
      />
      <br />
      <br />

      <Controller
        name="period"
        control={control}
        rules={{ required: "Period is required" }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            label="Period"
            value={value}
            required
            onChange={onChange}
            error={!!error}
            helperText={error ? error.message : null}
            fullWidth
          />
        )}
      />

      <br />
      <br />

      <Controller
        name="periodSpendLimit"
        control={control}
        rules={{
          required: "period spend limit is required",
          validate: (value) => {
            if (Number(getValues("spendLimit")) > 0) {
              return Number(getValues("spendLimit")) >= Number(value);
            }

            return Number(value) > 0;
          },
        }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            label="Period Spend Limit"
            value={value}
            required
            onChange={onChange}
            inputMode="decimal"
            error={!!error}
            helperText={
              error
                ? error.message.length === 0
                  ? Number(getValues("spendLimit")) > 0 &&
                    Number(value) > Number(getValues("spendLimit"))
                    ? "Period spend limit is greater than spend limit"
                    : "Invalid period spend limit"
                  : error.message
                : null
            }
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  {currency?.coinDenom}
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      <br />
    </>
  );
}

PeriodicFeegrant.propTypes = {
  loading: PropTypes.string.isRequired,
  onGrant: PropTypes.func.isRequired,
  currency: PropTypes.object.isRequired,
};
