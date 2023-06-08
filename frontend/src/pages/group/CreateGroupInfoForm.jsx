import React, { useState } from "react";
import { Paper, TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import { Grid } from "@mui/material";

export function CreateGroupInfoForm(props) {
  const { control, errors, groupName, forumUrl, description } = props;

  return (
    <>
      {/* group info section start */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
        }}
      >
        <Grid container spacing={2}>
          <Grid item md={6} xs={12}>
            <Controller
              defaultValue={groupName}
              name="name"
              control={control}
              rules={{
                required: "Name is required",
                maxLength: {
                  value: 25,
                  message: "Name length cannot be more than 25 characters",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="Name"
                  size="small"
                  name="Group name"
                  fullWidth
                  sx={{
                    mb: 2,
                  }}
                  error={errors?.name}
                  helperText={errors?.name?.message}
                />
              )}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <Controller
              defaultValue={forumUrl}
              name="forumUrl"
              control={control}
              rules={{
                required: "Forum url is required",
                maxLength: {
                  value: 70,
                  message: "Forum URL length cannot be more than 70 characters",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="url"
                  required
                  label="Forum URL"
                  size="small"
                  name="Group forum"
                  fullWidth
                  sx={{
                    mb: 2,
                  }}
                  error={errors?.forumUrl}
                  helperText={errors?.forumUrl?.message}
                />
              )}
            />
          </Grid>
        </Grid>
        <div>
          <Controller
            defaultValue={description}
            name="description"
            control={control}
            rules={{
              required: "Description is required",
              maxLength: {
                  value: 100,
                  message: "Description length cannot be more than 100 characters",
                },
            }}
            render={({ field }) => (
              <TextField
                defaultValue={description}
                {...field}
                required
                label="Description"
                multiline
                size="small"
                name="Group description"
                fullWidth
                sx={{
                  mb: 2,
                }}
                error={errors?.description}
                helperText={errors?.description?.message}
              />
            )}
          />
        </div>
      </Paper>
      {/* group info section end */}
    </>
  );
}

export default CreateGroupInfoForm;