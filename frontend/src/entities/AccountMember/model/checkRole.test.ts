import { describe, expect, test } from 'vitest';
import { checkRole } from './checkRole';

describe('Check role tests', () => {
  test('No user role', () => {
    expect(checkRole()).toBeFalsy();
    expect(checkRole(undefined, 'viewer')).toBeFalsy();
    expect(checkRole(undefined, 'editor')).toBeFalsy();
    expect(checkRole(undefined, 'admin')).toBeFalsy();
    expect(checkRole(undefined, 'owner')).toBeFalsy();
  });

  test('No required role', () => {
    expect(checkRole('viewer')).toBeTruthy();
    expect(checkRole('editor')).toBeTruthy();
    expect(checkRole('admin')).toBeTruthy();
    expect(checkRole('owner')).toBeTruthy();
  });

  test('Check viewer role', () => {
    expect(checkRole('viewer', 'viewer')).toBeTruthy();
    expect(checkRole('editor', 'viewer')).toBeTruthy();
    expect(checkRole('admin', 'viewer')).toBeTruthy();
    expect(checkRole('owner', 'viewer')).toBeTruthy();
  });

  test('Check contributor role', () => {
    expect(checkRole('viewer', 'editor')).toBeFalsy();
    expect(checkRole('editor', 'editor')).toBeTruthy();
    expect(checkRole('admin', 'editor')).toBeTruthy();
    expect(checkRole('owner', 'editor')).toBeTruthy();
  });

  test('Check admin role', () => {
    expect(checkRole('viewer', 'admin')).toBeFalsy();
    expect(checkRole('editor', 'admin')).toBeFalsy();
    expect(checkRole('admin', 'admin')).toBeTruthy();
    expect(checkRole('owner', 'admin')).toBeTruthy();
  });

  test('Check owner role', () => {
    expect(checkRole('viewer', 'owner')).toBeFalsy();
    expect(checkRole('editor', 'owner')).toBeFalsy();
    expect(checkRole('admin', 'owner')).toBeFalsy();
    expect(checkRole('owner', 'owner')).toBeTruthy();
  });
});
